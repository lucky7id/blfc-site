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

  $form.serializeArray().forEach((elm) => { data[elm.name] = elm.value || elm.checked; });

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
  const ga = window.ga || function () { }
  const data = {};

  e.stopPropagation();
  e.stopPropagation();

  $form.serializeArray().forEach((elm) => { 
    let val = elm.value;
    
    if (val === 'on') val = true;
    
    data[elm.name] = val;
  });

  $.post('https://api.yukine.me/blfc/riders', Object.assign({}, data, { tos_accept: true }), 'json')
    .then((res) => {
      ga('send', 'event', 'click', 'submit');
      
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
      ga('send', 'event', 'error', 'submit');
      console.error(err); //eslint-disable-line

      $errors.text((err.responseJSON && err.responseJSON.error) || err.responseText);
      $errors.show();
    }) //eslint-disable-line
    .always(() => {
      $('#terms-modal').modal('hide');
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

const handleStart = (scroll = true) => {
  const $hidden = $('section.d-none');
  const ga = window.ga || function () {}

  $.get('https://api.yukine.me/blfc/ping');

  $hidden.removeClass('d-none');
  $hidden.hide(0);
  $hidden.fadeIn(700);
  const btn = `<a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" data-size="large"
                data-text="I&#39;m joining the Big Lit Fur Coach party, and you should too!" data-url="https://yukine.me/blfc"
                data-hashtags="BigLitFurCoach" data-show-count="false">Share with your friends</a>`;

  $('#twitter-share').append(btn);
  $('body').append('<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>');
  if (scroll) $('html, body').animate({ scrollTop: $('#info').offset().top }, 500);
  ga('send', 'event', 'click', 'start');
};

const selectTier = ({currentTarget}) => {
  const $elm = $(currentTarget);
  const $input = $('#tier');
  const val = currentTarget.dataset.value;
  
  if ($elm.hasClass('active')) return;
  
  $input.val(val);
  $('.tier-option.active').removeClass('active');
  $elm.addClass('active');
}

const toggleExtraBag = ({currentTarget}) => {
  const $elm = $(currentTarget);
  const $input = $('#extra_bag');

  $input.prop('checked', !$input.prop('checked'));
  $elm.toggleClass('checked', $input.prop('checked'))
}

const init = () => {
  const $submit = $('#reserve-submit');
  const $termsSubmit = $('#terms-modal button');
  const $start = $('#start');
  const $tiers = $('.tier-option');
  const $extraBag = $('#bag-select');
  const confirmedMessage = `Thanks for your registration, you are all set! <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" data-size="large" data-text="I&#39;m joining the Big Lit Fur Coach party, and you should too!" data-url="https://yukine.me/blfc" data-hashtags="BigLitFurCoach" data-show-count="false">Share with your friends</a>`

  setTimeout(() => {
    $('#form-errors').hide();
    $('#form-feedback').hide();

    if (window.location.search.includes('confirmed=true&cid=')) {
      $('#reserve-form').hide();
      $('#form-feedback').html(confirmedMessage).show();
      handleStart(false);
      
      window.location.href = '#';
      window.location.href = '#reserve';
    }
  });

  $('#extra_bag').prop('checked', false);
  $extraBag.on('click', toggleExtraBag);
  $tiers.on('click', selectTier);
  $submit.on('click', handleSubmit);
  $termsSubmit.on('click', doPost);
  $start.on('click', handleStart);

  $.getJSON('https://api.yukine.me/blfc/riders')
    .done(renderTable)
    .fail(console.error); //eslint-disable-line
};

$(init);
