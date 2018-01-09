import 'material-design-icons/iconfont/material-icons.css';
import $ from 'jquery';
import './styles/style.sass';

const handleSubmit = () => {
  const $form = $('#reserve-form');
  const data = $form.serialize();

  console.log(data); //eslint-disable-line

  $.post('http://api.yukine.me/blfc/riders', data)
    .then((res) => {
      console.log(res); //eslint-disable-line
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
      $row.append(`<td>${rider.confirmed}</td>`);
    } else {
      $row.append('<td>&nbsp;</td>');
    }

    $results.append($row);
  });
};

const init = () => {
  const $submit = $('#reserve-submit');

  $submit.on('click', handleSubmit);
  $.getJSON('http://api.yukine.me/blfc/riders')
    .done(renderTable)
    .fail(console.error); //eslint-disable-line
};

$(init);
