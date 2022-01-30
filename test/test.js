'use strict';
const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const passportStub = require('passport-stub');
const User = require('../models/user');
const Dataset = require('../models/dataset');
const Candidate = require('../models/candidate');
const Availability = require('../models/availability');
const Comment = require('../models/comment');

describe('/login', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ username: 'testuser' });
   });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  test('ログインのためのリンクが含まれる', () => {
    return request(app)
      .get('/login')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/<a class="btn btn-info my-3" href="\/auth\/github"/)
      .expect(200);
  });

  test('ログイン時はユーザー名が表示される', () => {
    return request(app)
      .get('/login')
      .expect(/testuser/)
      .expect(200);
  });
});

describe('/logout', () => {
  test('/ にリダイレクトされる', () => {
    return request(app)
      .get('/logout')
      .expect('Location', '/')
      .expect(302);
  });
});

describe('/datasets', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  test('予定が作成でき、表示される', done => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/datasets')
        .send({
          datasetName: 'テスト予定1',
          memo: 'テストメモ1\r\nテストメモ2',
          candidates: 'テスト候補1\r\nテスト候補2\r\nテスト候補3'
        })
        .expect('Location', /datasets/)
        .expect(302)
        .end((err, res) => {
          const createddatasetPath = res.headers.location;
          request(app)
            .get(createddatasetPath)
            .expect(/テスト予定1/)
            .expect(/テストメモ1/)
            .expect(/テストメモ2/)
            .expect(/テスト候補1/)
            .expect(/テスト候補2/)
            .expect(/テスト候補3/)
            .expect(200)
            .end((err, res) => { deletedatasetAggregate(createddatasetPath.split('/datasets/')[1], done, err);});
        });
    });
  });
});

describe('/datasets/:datasetId/users/:userId/candidates/:candidateId', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  test('出欠が更新できる', (done) => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/datasets')
        .send({ datasetName: 'テスト出欠更新予定1', memo: 'テスト出欠更新メモ1', candidates: 'テスト出欠更新候補1' })
        .end((err, res) => {
          const createddatasetPath = res.headers.location;
          const datasetId = createddatasetPath.split('/datasets/')[1];
          Candidate.findOne({
            where: { datasetId: datasetId }
          }).then((candidate) => {
            // 更新がされることをテスト
            const userId = 0;
            request(app)
              .post(`/datasets/${datasetId}/users/${userId}/candidates/${candidate.candidateId}`)
              .send({ availability: 2 }) // 出席に更新
              .expect('{"status":"OK","availability":2}')
              .end((err, res) => {
                Availability.findAll({
                  where: { datasetId: datasetId }
                }).then((availabilities) => {
                  assert.strictEqual(availabilities.length, 1);
                  assert.strictEqual(availabilities[0].availability, 2);
                  deletedatasetAggregate(datasetId, done, err);
                });
              });
          });
        });
    });
  });
});

describe('/datasets/:datasetId/users/:userId/comments', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  test('コメントが更新できる', (done) => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/datasets')
        .send({
          datasetName: 'テストコメント更新予定1',
          memo: 'テストコメント更新メモ1',
          candidates: 'テストコメント更新候補1'
        })
        .end((err, res) => {
          const createddatasetPath = res.headers.location;
          const datasetId = createddatasetPath.split('/datasets/')[1];
          // 更新がされることをテスト
          const userId = 0;
          request(app)
            .post(`/datasets/${datasetId}/users/${userId}/comments`)
            .send({ comment: 'testcomment' })
            .expect('{"status":"OK","comment":"testcomment"}')
            .end((err, res) => {
              Comment.findAll({
                where: { datasetId: datasetId }
              }).then((comments) => {
                assert.strictEqual(comments.length, 1);
                assert.strictEqual(comments[0].comment, 'testcomment');
                deletedatasetAggregate(datasetId, done, err);
              });
            });
        });
    });
  });
});

function deletedatasetAggregate(datasetId, done, err) {
  const promiseCommentDestroy = Comment.findAll({
    where: { datasetId: datasetId }
  }).then(comments => {
    return Promise.all(
      comments.map(c => {
        return c.destroy();
      })
    );
  });

  Availability.findAll({
    where: { datasetId: datasetId }
  })
    .then(availabilities => {
      const promises = availabilities.map(a => {
        return a.destroy();
      });
      return Promise.all(promises);
    })
    .then(() => {
      return Candidate.findAll({
        where: { datasetId: datasetId }
      });
    })
    .then(candidates => {
      const promises = candidates.map(c => {
        return c.destroy();
      });
      promises.push(promiseCommentDestroy);
      return Promise.all(promises);
    })
    .then(() => {
      return dataset.findByPk(datasetId).then(s => {
        return s.destroy();
      });
    })
    .then(() => {
      if (err) return done(err);
      done();
    });
}
