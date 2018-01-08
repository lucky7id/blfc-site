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

const init = () => {
  const $submit = $('#reserve-submit');

  $submit.on('click', handleSubmit);
};

$(init);
