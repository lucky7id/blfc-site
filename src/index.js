import './styles/style.sass';
import $ from 'jquery';

const handleSubmit = () => {
  const $form = $('#reserve-form');
  const data = $form.serialize();

  console.log(data);

  $.post('http://api.yukine.me/blfc/riders', data)
    .then((res) => {
      console.log(res);
    })
    .catch(console.error);
};

const init = () => {
  const $submit = $('#reserve-submit');

  $submit.on('click', handleSubmit);
};

$(init);
