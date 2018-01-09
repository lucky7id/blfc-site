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
<tr>
  <td>
    <div class="avatar-container">
      <img src="https://avatars.io/twitter/${rider.twitter} />
    </div>
  </td>
  <td>${rider.char_name}</td>
  <td>${rider.twitter}</td>
  <td>${rider.telegram}</td>
  <td>${rider.confirmed}</td>
</tr>
`;

const renderTable = (data) => {
  const $results = $('#riders-body');
  const rows = data.map(getRow).join('');

  $results.append(rows);
};

const init = () => {
  const $submit = $('#reserve-submit');

  $submit.on('click', handleSubmit);
  $.get('http://api.yukine.me/blfc/riders')
    .done(renderTable)
    .fail(console.error); //eslint-disable-line
};

$(init);
