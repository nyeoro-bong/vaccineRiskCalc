'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const Dataset = require('../models/dataset');
const Candidate = require('../models/candidate');
const User = require('../models/user');
const Availability = require('../models/availability');
const Comment = require('../models/comment');

router.get('/new', authenticationEnsurer, (req, res, next) => {
  res.render('new', { user: req.user });
});

router.post('/', authenticationEnsurer, (req, res, next) => {
  const datasetId = uuid.v4();
  const updatedAt = new Date();
  Dataset.create({
    datasetId: datasetId,
    datasetName: req.body.datasetName.slice(0, 255) || '（名称未設定）',
    uAge: req.body.uAge,
    uVac: req.body.uVac,
    uPref: req.body.uPref,
    memo: req.body.memo,
    createdBy: req.user.id,
    updatedAt: updatedAt
  }).then((dataset) => {
    createCandidatesAndRedirect(parseCandidateNames(req), datasetId, res);
  });
});

router.get('/:datasetId', authenticationEnsurer, (req, res, next) => {
  let storedDataset = null;
  let storedCandidates = null;
  Dataset.findOne({
    include: [
      {
        model: User,
        attributes: ['userId', 'username']
      }
    ],
    where: { datasetId: req.params.datasetId },
    order: [['updatedAt', 'DESC']]
  }).then(dataset => {
      if (dataset) {
        storedDataset = dataset;
        return Candidate.findAll({
          where: { datasetId: dataset.datasetId },
          order: [['candidateId', 'ASC']]
        });
      } else {
        const err = new Error('指定された予定は見つかりません');
        err.status = 404;
        next(err);
      }
    }).then(candidates => {
      // データベースからその予定の全ての出欠を取得する
      storedCandidates = candidates;
      return Availability.findAll({
        include: [
          {
            model: User,
            attributes: ['userId', 'username']
          }
        ],
        where: { datasetId: storedDataset.datasetId },
        order: [[User, 'username', 'ASC'], ['candidateId', 'ASC']]
      });
    }).then((availabilities) => {
      // 出欠 MapMap(キー:ユーザー ID, 値:出欠Map(キー:候補 ID, 値:出欠)) を作成する
      const availabilityMapMap = new Map(); // key: userId, value: Map(key: candidateId, availability)
      availabilities.forEach(a => {
        const map = availabilityMapMap.get(a.user.userId) || new Map();
        map.set(a.candidateId, a.availability);
        availabilityMapMap.set(a.user.userId, map);
      });

      // 閲覧ユーザーと出欠に紐づくユーザーからユーザー Map (キー:ユーザー ID, 値:ユーザー) を作る
      const userMap = new Map(); // key: userId, value: User
      userMap.set(parseInt(req.user.id), {
          isSelf: true,
          userId: parseInt(req.user.id),
          username: req.user.username
      });
      availabilities.forEach((a) => {
        userMap.set(a.user.userId, {
          isSelf: parseInt(req.user.id) === a.user.userId, // 閲覧ユーザー自身であるかを含める
          userId: a.user.userId,
          username: a.user.username
        });
      });

      // 全ユーザー、全候補で二重ループしてそれぞれの出欠の値がない場合には、「欠席」を設定する
      const users = Array.from(userMap).map(keyValue => keyValue[1]);
      users.forEach(u => {
        storedCandidates.forEach(c => {
          const map = availabilityMapMap.get(u.userId) || new Map();
          const a = map.get(c.candidateId) || 0; // デフォルト値は 0 を利用
          map.set(c.candidateId, a);
          availabilityMapMap.set(u.userId, map);
        });
      });

      // コメント取得
      return Comment.findAll({
        where: { datasetId: storedDataset.datasetId }
      }).then(comments => {
        const commentMap = new Map(); // key: userId, value: comment
        comments.forEach(comment => {
          commentMap.set(comment.userId, comment.comment);
        });

        res.render('dataset', {
          user: req.user,
          dataset: storedDataset,
          candidates: storedCandidates,
          users: users,
          availabilityMapMap: availabilityMapMap,
          commentMap: commentMap
        });
      });
    });
      // } else {
      //   const err = new Error('指定された予定は見つかりません');
      //   err.status = 404;
      //   next(err);
      // }

});

router.get('/:datasetId/edit', authenticationEnsurer, (req, res, next) => {
  Dataset.findOne({
    where: {
      datasetId: req.params.datasetId
    }
  }).then((dataset) => {
    if (isMine(req, dataset)) { // 作成者のみが編集フォームを開ける
      Candidate.findAll({
        where: { datasetId: dataset.datasetId },
        order: [['candidateId', 'ASC']]
      }).then((candidates) => {
        res.render('edit', {
          user: req.user,
          dataset: dataset,
          candidates: candidates
        });
      });
    } else {
      const err = new Error('指定された予定がない、または、予定する権限がありません');
      err.status = 404;
      next(err);
    }
  });
});

function isMine(req, dataset) {
  return dataset && parseInt(dataset.createdBy) === parseInt(req.user.id);
}

router.post('/:datasetId', authenticationEnsurer, (req, res, next) => {
  Dataset.findOne({
    where: {
      datasetId: req.params.datasetId
    }
  }).then((dataset) => {
    if (dataset && isMine(req, dataset)) {
      if (parseInt(req.query.edit) === 1) {
        const updatedAt = new Date();
        dataset.update({
          datasetId: dataset.datasetId,
          datasetName: req.body.datasetName.slice(0, 255) || '（名称未設定）',
          memo: req.body.memo,
          createdBy: req.user.id,
          updatedAt: updatedAt
        }).then((dataset) => {
          // 追加されているかチェック
          const candidateNames = parseCandidateNames(req);
          if (candidateNames) {
            createCandidatesAndRedirect(candidateNames, dataset.datasetId, res);
          } else {
            res.redirect('/datasets/' + dataset.datasetId);
          }
        });
      } else if (parseInt(req.query.delete) === 1) {
        deleteDatasetAggregate(req.params.datasetId, () => {
          res.redirect('/');
        });
      } else {
        const err = new Error('不正なリクエストです');
        err.status = 400;
        next(err);
      }
    } else {
      const err = new Error('指定された予定がない、または、編集する権限がありません');
      err.status = 404;
      next(err);
    }
  });
});

function deleteDatasetAggregate(datasetId, done, err) {
  const promiseCommentDestroy = Comment.findAll({
    where: { datasetId: datasetId }
  }).then((comments) => {
    return Promise.all(comments.map((c) => { return c.destroy(); }));
  });

  Availability.findAll({
    where: { datasetId: datasetId }
  }).then((availabilities) => {
    const promises = availabilities.map((a) => { return a.destroy(); });
    return Promise.all(promises);
  }).then(() => {
    return Candidate.findAll({
      where: { datasetId: datasetId }
    });
  }).then((candidates) => {
    const promises = candidates.map((c) => { return c.destroy(); });
    promises.push(promiseCommentDestroy);
    return Promise.all(promises);
  }).then(() => {
    return Dataset.findByPk(datasetId).then((s) => { return s.destroy(); });
  }).then(() => {
    if (err) return done(err);
    done();
  });
}

router.deleteDatasetAggregate = deleteDatasetAggregate;

function createCandidatesAndRedirect(candidateNames, datasetId, res) {
  const candidates = candidateNames.map((c) => {
    return {
      candidateName: c,
      datasetId: datasetId
    };
  });
  Candidate.bulkCreate(candidates).then(() => {
    res.redirect('/datasets/' + datasetId);
  });
}

function parseCandidateNames(req) {
  return req.body.candidates.trim().split('\n').map((s) => s.trim()).filter((s) => s !== "");
};

module.exports = router;

//     //       res.render('dataset', {
//     //         user: req.user,
//     //         dataset: dataset,
//     //         candidates: candidates,
//     //         users: [req.user],
//     //         availabilityMapMap: availabilityMapMap
//     //       });
//     //     });
//     //   });




//     //   storedCandidates = candidates;
//     //   });
//     // })
//     // .then((availabilities) => {

//     //     });
//     //   });

//     //   const err = new Error('指定された予定がない、または、編集する権限がありません');
//     //   err.status = 404;
//     //   next(err);
//     }
//   });






//       // コメント取得
//       Comment.findAll({
//         where: { datasetId: dataset.datasetId }
//       }).then((comments) => {
//         const commentMap = new Map();  // key: userId, value: comment
//         comments.forEach((comment) => {
//           commentMap.set(comment.userId, comment.comment);
//         });
//   });
// });