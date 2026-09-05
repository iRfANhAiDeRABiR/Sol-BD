// Ambient declarations for CSS side-effect and module imports
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
