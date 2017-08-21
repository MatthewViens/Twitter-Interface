const form = document.getElementsByTagName('FORM');
const textArea = document.getElementById('tweet-textarea');
const count = document.getElementById('tweet-char');

let maxCount = 140;

textArea.addEventListener('keyup', ()=> {
  count.textContent = Math.abs(maxCount - textArea.value.length);
  if(textArea.value.length > maxCount){
    count.style.color = 'red';
  } else {
    count.style.color = '#ccc';
  }
});
