import React from 'react';

// The SVG icons for the window buttons
const icons = {
  minimize: <svg x="0px" y="0px" viewBox="0 0 10.2 1"><rect x="0" y="0" width="10.2" height="1"></rect></svg>,
  maximize: <svg x="0px" y="0px" viewBox="0 0 10.2 10.1"><path d="M0,0v10.1h10.2V0H0z M9.2,9.2H1V1h8.2V9.2z"></path></svg>,
  close: <svg x="0px" y="0px" viewBox="0 0 10.2 10.2"><polygon points="10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1"></polygon></svg>
};

const Button = ({ onClick, icon, isCloseBtn = false }) => (
  <button
    onClick={onClick}
    className={`no-drag w-10 h-8 flex justify-center items-center fill-current text-white hover:bg-zinc-700 ${isCloseBtn ? 'hover:bg-red-600' : ''}`}
  >
    <div className="w-3 h-3">
      {icon}
    </div>
  </button>
);

export function WindowControls() {
  return (
    <div className="flex">
      <Button onClick={() => window.electronAPI.minimizeWindow()} icon={icons.minimize} />
      <Button onClick={() => window.electronAPI.maximizeWindow()} icon={icons.maximize} />
      <Button onClick={() => window.electronAPI.closeWindow()} icon={icons.close} isCloseBtn />
    </div>
  );
}