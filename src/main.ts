import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Vite + TS</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
  </div>
`;

const element = document.querySelector<HTMLButtonElement>("#counter")!;

let counter = 0;

const setCounter = (count: number) => {
  counter = count;
  element.innerHTML = `count is ${counter}`;
};
element.addEventListener("click", () => setCounter(counter + 1));
setCounter(0);
