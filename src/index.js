import 'material-design-icons/iconfont/material-icons.css';
import $ from 'jquery';
import moment from 'moment';
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

  $.postJSON('http://api.yukine.me/blfc/riders', data)
    .then((res) => {
      if (res.status === 'bus-full') {
        $feedback.text('Looks like the bus is full, but we have saved your info and will reach out should more spots open up');
        $feedback.show();
      }

      if (res.status === 'not-21') {
        $feedback.text('Looks like you will not be 21 in time for this bus. We have saved your info and will reach out should a second all ages bus open');
        $feedback.show();
      }
    })
    .catch(console.error); //eslint-disable-line
};

const getRow = rider => `
<td>${rider.char_name}</td>
<td>${rider.twitter}</td>
<td>${rider.telegram}</td>
`;

const getAvatar = rider => `<td><div class="twitter-avatar-container"><img class="img-fluid" src="https://avatars.io/twitter/${rider.twitter}" /></div></td>`;

const renderTable = (data) => {
  const $results = $('#riders-body');
  console.log(data); //eslint-disable-line

  data.forEach((rider) => {
    const $row = $('<tr></tr>');

    $row.append(getAvatar(rider));
    $row.append(getRow(rider));

    if (rider.confirmed) {
      $row.append(`<td><img src=${confirmed} class="img-fluid" /></td>`);
    } else {
      $row.append('<td>&nbsp;</td>');
    }

    $results.append($row);
  });
};

const init = () => {
  const $submit = $('#reserve-submit');

  $('#form-errors').hide();
  $('#form-feedback').hide();

  $submit.on('click', handleSubmit);
  $.getJSON('http://api.yukine.me/blfc/riders')
    .done(renderTable)
    .fail(console.error); //eslint-disable-line
};

$(init);
