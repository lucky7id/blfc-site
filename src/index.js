import $ from 'jquery';
import 'bootstrap';
import moment from 'moment';

import 'material-design-icons/iconfont/material-icons.css';
import './styles/socicon.css';
import './styles/style.sass';
import confirmed from './img/confirmed.png';

const handleSubmit = (e) => {
  const $form = $('#reserve-form');
  const $errors = $('#form-errors');
  const $feedback = $('#form-feedback');
  const data = {};

  e.preventDefault();
  $errors.hide();
  $feedback.hide();

  $form.serializeArray().forEach((elm) => { data[elm.name] = elm.value; });

  console.log(data); //eslint-disable-line

  if (!data.name) {
    $errors.text('Missing "Name" - must match name on ID');
    $errors.show();

    return;
  }

  if (!data.char_name) {
    $errors.text('Missing "Display/Character Name"');
    $errors.show();

    return;
  }

  if (!data.email) {
    $errors.text('Missing "Email" - this is where we will send confirmation!');
    $errors.show();

    return;
  }

  if (data.email !== data.verify_email) {
    $errors.text('Emails do not match');
    $errors.show();

    return;
  }

  if (!data.birth_date) {
    $errors.text('Missing "Date of Birth" - this is where we will send confirmation!');
    $errors.show();

    return;
  }

  if (!moment(data.birth_date, 'MM/DD/YYYY').isValid()) {
    $errors.text('"Date of Birth must be in the format of MM/DD/YYYY or MM-DD-YYYY');
    $errors.show();

    return;
  }

  $('#terms-modal').modal('show');
  $('#terms-modal button').on('click', () => {
    $.post('http://api.yukine.me/blfc/riders', Object.assign({}, data, { tos_accept: true }), 'json')
      .then((res) => {
        if (res.status === 'bus-full') {
          $feedback.text('Looks like the bus is full, but we have saved your info and will reach out should more spots open up');
          $feedback.show();
        }

        if (res.status === 'not-21') {
          $feedback.text('Looks like you will not be 21 in time for this bus. We have saved your info and will reach out should a second all ages bus open');
          $feedback.show();
        }

        if (res.data.url) {
          window.location = res.data.url;
        }

        console.log(res);
      })
      .catch(console.error) //eslint-disable-line
      .always(() => {
        $('#terms-modal').modal('hide');
      });
  });
};


const getRiderBlock = rider => `
<div class="social-container mb-3">
  <div class="social-content d-flex">
    <div class="twitter-avatar-container d-none d-lg-block align-self-center">
      <img class="img-fluid" src="https://avatars.io/twitter/${rider.twitter}/small">
    </div>
    <div class="text-content row justify-content-between">
      <div class="col-md col-sm-12 social-item mb-4 mt-4">
        <div class="social-title">Name</div>
        <div class="social-value">${rider.char_name}</div>
      </div>
      <div class="col-md col-sm-12 social-item mb-4 mt-4">
        <div class="social-title">Twitter</div>
        <div class="social-value">
          ${rider.twitter ? `<a href="https://twitter.com/${rider.twitter.replace('@', '')}" target="_blank">${rider.twitter}</a>` : '--'}
        </div>
      </div>
      <div class="col-md col-sm-12 social-item mb-4 mt-4">
        <div class="social-title">Telegram</div>
        <div class="social-value">
          ${rider.telegram ? `<a href="https://t.me/${rider.telegram.replace('@', '')}" target="_blank">${rider.telegram}</a>` : '--'}
        </div>
      </div>
      <div class="col-md col-sm-12 social-item mb-4 mt-4 d-flex pl-5 ${rider.confirmed ? '' : 'vis-0'} ">
        <div class="social-value confirmed"><img src="${confirmed}" class="img-fluid" /></div>
        <div class="social-title confirmed">Confirmed</div>
      </div>
    </div>
  </div>
</div>`;

const renderTable = (data) => {
  const $results = $('.rider-anchor');

  data.forEach((rider) => {
    const html = getRiderBlock(rider);
    $results.append(html);
  });
};

const init = () => {
  const $submit = $('#reserve-submit');

  setTimeout(() => {
    $('#form-errors').hide();
    $('#form-feedback').hide();
  });

  $submit.on('click', handleSubmit);
  $.getJSON('http://api.yukine.me/blfc/riders')
    .done(renderTable)
    .fail(console.error); //eslint-disable-line
};

$(init);
