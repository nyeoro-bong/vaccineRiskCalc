'use strict';
import $ from 'jquery';
globalThis.jQuery = $;
import bootstrap from 'bootstrap';

$('.availability-toggle-button').each((i, e) => {
  const button = $(e);
  button.click(() => {
    const datasetId = button.data('dataset-id');
    const userId = button.data('user-id');
    const candidateId = button.data('candidate-id');
    const availability = parseInt(button.data('availability'));
    const nextAvailability = (availability + 1) % 3;
    $.post(
      `/datasets/${datasetId}/users/${userId}/candidates/${candidateId}`,
      { availability: nextAvailability },
      data => {
        button.data('availability', data.availability);
        const availabilityLabels = ['欠', '予', '済'];
        button.text(availabilityLabels[data.availability]);

        const buttonStyles = ['btn-danger', 'btn-secondary', 'btn-success'];
        button.removeClass('btn-danger btn-secondary btn-success');
        button.addClass(buttonStyles[data.availability]);      }
    );
  });
});

const buttonSelfComment = $('#self-comment-button');
buttonSelfComment.click(() => {
  const datasetId = buttonSelfComment.data('dataset-id');
  const userId = buttonSelfComment.data('user-id');
  const comment = prompt('コメントを255文字以内で入力してください。');
  if (comment) {
    $.post(`/datasets/${datasetId}/users/${userId}/comments`,
      { comment: comment },
      (data) => {
        $('#self-comment').text(data.comment);
      });
  }
});