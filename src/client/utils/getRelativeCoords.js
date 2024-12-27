export default function getRelativeCoords(el) {
  // Transforms don't play well with `getBoundingClientRect`, so temporarily
  // remove it to get the correct measurements, then reapply it.
  const hasTransform = !!el.style.transform;
  let prevTransform;
  if (hasTransform) {
    prevTransform = el.style.transform;
    el.style.transform = 'unset';
  }
  
  const parRect = el.parentNode.getBoundingClientRect();
  const childRect  = el.getBoundingClientRect();
  
  if (hasTransform) el.style.transform = prevTransform;
  
  return {
    x: childRect.left - parRect.left,
    y: childRect.top - parRect.top,
  };
}