document.addEventListener('click', function (e) {
  var btn = e.target.closest('.video-embed-trigger');
  if (!btn) return;
  var wrap = btn.closest('.video-embed');
  var id = wrap.getAttribute('data-video-id');
  wrap.innerHTML = '<iframe width="320" height="180" src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1" title="YouTube video player" style="width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
});
