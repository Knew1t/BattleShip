let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/projects/Front_bootcamp_team00-1/src/site/src/static
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +14 source_code/refactoring/ship.js
badd +12 source_code/refactoring/main.js
badd +1 source_code/refactoring/fleet.js
badd +2 source_code/game_menu.js
badd +1 source_code/refactoring/grid.js
badd +1 source_code/refactoring/controller.js
badd +13 source_code/refactoring/model.js
badd +2 source_code/refactoring/view.js
badd +74 source_code/refactoring/agents.js
badd +30 ~/projects/Front_bootcamp_team00-1/src/site/src/static/source_code/refactoring/constants.js
argglobal
%argdel
edit source_code/refactoring/model.js
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
vsplit
wincmd _ | wincmd |
vsplit
2wincmd h
wincmd w
wincmd w
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
exe 'vert 1resize ' . ((&columns * 93 + 142) / 284)
exe 'vert 2resize ' . ((&columns * 95 + 142) / 284)
exe 'vert 3resize ' . ((&columns * 94 + 142) / 284)
argglobal
balt ~/projects/Front_bootcamp_team00-1/src/site/src/static/source_code/refactoring/constants.js
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 5 - ((4 * winheight(0) + 36) / 73)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 5
normal! 0
wincmd w
argglobal
if bufexists(fnamemodify("source_code/refactoring/fleet.js", ":p")) | buffer source_code/refactoring/fleet.js | else | edit source_code/refactoring/fleet.js | endif
if &buftype ==# 'terminal'
  silent file source_code/refactoring/fleet.js
endif
balt source_code/refactoring/grid.js
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 11 - ((10 * winheight(0) + 36) / 73)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 11
normal! 0
wincmd w
argglobal
if bufexists(fnamemodify("source_code/game_menu.js", ":p")) | buffer source_code/game_menu.js | else | edit source_code/game_menu.js | endif
if &buftype ==# 'terminal'
  silent file source_code/game_menu.js
endif
balt source_code/refactoring/grid.js
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 731 - ((39 * winheight(0) + 36) / 73)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 731
normal! 0
wincmd w
2wincmd w
exe 'vert 1resize ' . ((&columns * 93 + 142) / 284)
exe 'vert 2resize ' . ((&columns * 95 + 142) / 284)
exe 'vert 3resize ' . ((&columns * 94 + 142) / 284)
tabnext 1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
let &winminheight = s:save_winminheight
let &winminwidth = s:save_winminwidth
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
set hlsearch
nohlsearch
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
