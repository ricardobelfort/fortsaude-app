declare module 'feather-icons' {
  type FeatherIcon = {
    toSvg: (options?: Record<string, string | number>) => string;
  };

  const feather: {
    icons: Record<string, FeatherIcon>;
  };

  export default feather;
}
