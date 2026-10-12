(()=>{
  const gallery=document.querySelector('.work-gallery');
  const toggle=document.querySelector('.work-motion-toggle');
  const dialog=document.querySelector('.work-lightbox');
  if(!gallery||!dialog)return;
  let opener,suppressClickUntil=0;
  toggle.addEventListener('click',()=>{
    const paused=gallery.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.textContent=paused?'تشغيل الحركة':'إيقاف الحركة';
  });
  gallery.querySelectorAll('.work-window').forEach(viewport=>{
    const row=viewport.closest('.work-row');
    const track=viewport.querySelector('.work-track');
    let drag;
    viewport.querySelectorAll('img').forEach(image=>image.draggable=false);
    viewport.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      drag={id:event.pointerId,startX:event.clientX,lastX:event.clientX,moved:false};
    });
    viewport.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.id)return;
      if(!drag.moved&&Math.abs(event.clientX-drag.startX)<5)return;
      if(!drag.moved){
        drag.moved=true;
        row.classList.add('is-dragging');
        viewport.setPointerCapture(event.pointerId);
      }
      const delta=event.clientX-drag.lastX;
      drag.lastX=event.clientX;
      const animation=track.getAnimations()[0];
      if(animation){
        const duration=Number(animation.effect.getComputedTiming().duration);
        const distance=track.querySelector('.work-group').getBoundingClientRect().width;
        const direction=getComputedStyle(track).animationDirection==='reverse'?1:-1;
        const next=Number(animation.currentTime)+direction*delta*duration/distance;
        animation.currentTime=((next%duration)+duration)%duration;
      }else{
        viewport.scrollLeft-=delta;
      }
      event.preventDefault();
    });
    const finish=event=>{
      if(!drag||event.pointerId!==drag.id)return;
      if(drag.moved)suppressClickUntil=performance.now()+350;
      if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);
      row.classList.remove('is-dragging');
      drag=undefined;
    };
    viewport.addEventListener('pointerup',finish);
    viewport.addEventListener('pointercancel',finish);
    viewport.addEventListener('lostpointercapture',finish);
    viewport.addEventListener('pointerleave',event=>{if(drag&&!drag.moved)finish(event);});
  });
  gallery.addEventListener('click',event=>{
    if(performance.now()<suppressClickUntil){event.preventDefault();return;}
    const card=event.target.closest('[data-work-image]');
    if(!card)return;
    opener=card;
    const image=dialog.querySelector('img');
    image.src=card.dataset.workImage;
    image.alt=card.dataset.workTitle;
    dialog.querySelector('h3').textContent=card.dataset.workTitle;
    dialog.showModal();
    gallery.classList.add('lightbox-open');
  });
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const box=dialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
  });
  dialog.addEventListener('close',()=>{
    gallery.classList.remove('lightbox-open');
    if(opener&&!opener.closest('[aria-hidden]'))opener.focus({preventScroll:true});
  });
})();
