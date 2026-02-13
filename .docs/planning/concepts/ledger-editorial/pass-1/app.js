(function(){
  const buttons = Array.from(document.querySelectorAll('.nav-item'));
  const views = Array.from(document.querySelectorAll('.view'));
  function activate(id){
    buttons.forEach((b)=>b.classList.toggle('active', b.dataset.view===id));
    views.forEach((v)=>v.classList.toggle('active', v.dataset.view===id));
    const u = new URL(window.location.href); u.hash = id; history.replaceState({},'',u);
  }
  buttons.forEach((b)=>b.addEventListener('click',()=>activate(b.dataset.view)));
  activate(window.location.hash ? window.location.hash.slice(1) : 'dashboard');
})();
