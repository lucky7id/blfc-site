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
  e.stopPropagation();
  $errors.hide();
  $feedback.hide();

  $form.serializeArray().forEach((elm) => { data[elm.name] = elm.value; });

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
};

const doPost = (e) => {
  const $form = $('#reserve-form');
  const $errors = $('#form-errors');
  const $feedback = $('#form-feedback');
  const data = {};

  e.stopPropagation();
  e.stopPropagation();

  $form.serializeArray().forEach((elm) => { data[elm.name] = elm.value; });

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

      if (res.status === 'email-found') {
        $feedback.text('Looks like someone already signed up with that email');
        $feedback.show();
      }

      if (res.url) {
        $feedback.html(`Awesome! Your info submitted successfully, check your email for a link to finish your registration, <a href="${res.url}">or click here to finish now.</a>`);
        $feedback.show();
      }
    })
    .catch((err) => {
      console.error(err); //eslint-disable-line

      $errors.text((err.responseJSON && err.responseJSON.error) || err.responseText);
      $errors.show();
    }) //eslint-disable-line
    .always(() => {
      $('#terms-modal').modal('hide');
    });
};

const handleInfoSubmit = (e) => {
  const $form = $('#info-form');
  const $form2 = $('#reserve-form');
  const $errors = $('#form-errors');
  const $feedback = $('#form-feedback');
  const $email = $('#infoEmail');

  e.preventDefault();
  e.stopPropagation();

  if (!$email.val()) {
    $errors.text('Please provide a valid email');
    $errors.show();

    return;
  }

  $.post('http://api.yukine.me/blfc/interest', { email: $email.val() })
    .then(() => {
      $form.hide();
      $errors.hide();
      $feedback.hide();
      $('#info-copy').hide();
      $('#reserve-copy').show();
      $feedback.text('All Set, look for updates in your inbox');
      $('#email').val($email.val());
      $form2.show();
    })
    .catch((err) => {
      console.error(err); //eslint-disable-line

      $errors.text((err.responseJSON && err.responseJSON.error) || err.responseText);
      $errors.show();
    });
};

const moveToReg = (e) => {
  const $feedback = $('#form-feedback');
  const $email = $('#infoEmail');
  const $form = $('#info-form');
  const $form2 = $('#reserve-form');

  e.preventDefault();
  e.stopPropagation();

  if (!$email.val()) {
    $feedback.text('Please provide a valid email');
    $feedback.show();

    return;
  }

  $('#email').val($email.val());
  $form.hide();
  $('#info-copy').hide();
  $('#reserve-copy').show();
  $form2.show();
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

const handleStart = () => {
  const $hidden = $('section.d-none');

  $hidden.removeClass('d-none');
  $hidden.hide(0);
  $hidden.fadeIn(700);
  $('html, body').animate({ scrollTop: $('#info').offset().top }, 500);
};

const init = () => {
  const $submit = $('#reserve-submit');
  const $infoSubmit = $('#info-submit');
  const $infoReg = $('#info-reg');
  const $termsSubmit = $('#terms-modal button');
  const $start = $('#start');
  const confirmedMessage = '<span>You are all set! Thanks for riding with us! Please fill out the <a href="https://docs.google.com/forms/d/e/1FAIpQLSeL6P964tdx6-VHJ1Jq8jpHQQHHTCAiiQz0eQx_bVb0aeGt2g/viewform?usp=sf_link"> luggage form </a> to help us plan!</span>';

  setTimeout(() => {
    $('#form-errors').hide();
    $('#form-feedback').hide();
    $('#reserve-form').hide();
    $('#reserve-copy').hide();

    if (window.location.search.includes('confirmed=true&cid=')) {
      $('#reserve-form').hide();
      $('#form-feedback').html(confirmedMessage).show();
      window.location.href = '#';
      window.location.href = '#reserve';
    }

    if (window.location.search.includes('reserveCb=true')) {
      $('#reserve-form').show();
      $('#reserve-copy').show();
      $('#info-form').hide();
      $('#info-copy').hide();
      window.location.href = '#';
      window.location.href = '#reserve';
    }
  });

  $submit.on('click', handleSubmit);
  $infoSubmit.on('click', handleInfoSubmit);
  $infoReg.on('click', moveToReg);
  $termsSubmit.on('click', doPost);
  $start.on('click', handleStart);

  $.getJSON('http://api.yukine.me/blfc/riders')
    .done(renderTable)
    .fail(console.error); //eslint-disable-line
};

$(init);
