export const THEME_STORAGE_KEY = 'giftlist-theme'

/** Runs before paint to prevent a flash of the wrong theme. */
export const themeBootScript = `(function(){try{var key='${THEME_STORAGE_KEY}';var mode=localStorage.getItem(key)||'system';var dark=mode==='dark'||(mode!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';document.documentElement.style.colorScheme=dark?'dark':'light';var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',dark?'#11100f':'#faf9f7');}catch(e){}})();`
