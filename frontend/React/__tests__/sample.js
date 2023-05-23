'use strict';

export function FormTest() {

  function handleOnInput(event) {
    console.log('FormTest() in handleOnInput().')
    event.stopPropagation();
    if (event.target.validity.valid) {
      console.log('FormTest() in handleOnInput(), event.target.validity.valid.')
      console.log(`FormTest() in handleOnInput(), event.target.value:  ${Number(event.target.value)}`)
    } else {
      console.log('FormTest() in handleOnInput(), !event.target.validity.valid.')
      event.target.value='';
    }
  }

  return (
    <div>
    <form className="test-form">
    <label className="test-form-label" htmlFor="number_entered">Number entered:</label>
    <input className="test-form-input" type="number" id="number_entered" name="numberEntered" size="5" min="1" step="1" onInput={handleOnInput} />
    </form>
    </div>
  );
}