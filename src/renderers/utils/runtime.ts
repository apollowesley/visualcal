// Removes all design-time helpers
export const removeDesignTimeFromAllElements = () => {
  const designVisibleElements = document.querySelectorAll('.design-visible')
  designVisibleElements.forEach(el => el.classList.remove('design-visible'));
}
