import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
@import url('https://38k1k1qleotl9tja.public.blob.vercel-storage.com/Nohemi-Bold-WZIeKJtIWPKPZmx4INENIkapoXPehJ.woff2');
@import url('https://38k1k1qleotl9tja.public.blob.vercel-storage.com/Nohemi-Medium-pBShVkTxu1a7zL7t9s8kSy3CtBtVHH.woff2');
@import url('https://38k1k1qleotl9tja.public.blob.vercel-storage.com/Nohemi-Regular-DUcMLV9rm0J6Vz2aeEP00pefAyzt1S.woff2');
@import url('https://38k1k1qleotl9tja.public.blob.vercel-storage.com/Nohemi-SemiBold-g6evWhJlyeIsTotRjBBANMIb3MjbMG.woff2');

:root {
  interpolate-size: allow-keywords;
}

body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
    min-width: 320px;
    min-height: 100vh;
    font-size: 16px;
}

@keyframes accordionSlideDown {
  from {
    opacity: 0;
    height: 0;
  }
  to {
    opacity: 1;
    height: var(--height);
  }
}

@keyframes accordionSlideUp {
  from {
    opacity: 1;
    height: var(--height);
  }
  to {
    opacity: 0;
    height: 0;
  }
}

@keyframes fadeIn{
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut{
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

[data-part='item-content'][data-state='open'] {
  animation: accordionSlideDown 300ms ease-in-out;
}

[data-part='item-content'][data-state='closed'] {
  animation: accordionSlideUp 300ms ease-in-out;
  overflow: hidden;
}

[data-scope='combobox'][data-part='trigger'],
[data-scope='select'][data-part='indicator'],
[data-scope='accordion'][data-part='item-indicator'],
[data-scope='menu'][data-part='indicator'] {
  transition: transform 300ms ease;
}

[data-scope='combobox'][data-part='trigger'][data-state='open'],
[data-scope='select'][data-part='indicator'][data-state='open'],
[data-scope='accordion'][data-part='item-indicator'][data-state='open'],
[data-scope='menu'][data-part='indicator'][data-state='open'] {
  transform: rotate(-180deg);
}

`;

export default GlobalStyles;
