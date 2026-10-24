/** Runs before first paint (inline in <head>): applies a theme saved by the toggle. */
export const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
