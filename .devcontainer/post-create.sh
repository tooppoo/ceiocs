
#!/bin/bash

for shell_rc in ~/.bashrc ~/.zshrc ~/.profile; do
  touch "${shell_rc}"
done

## setup alias
ALIAS_FILE="${HOME}/.shell_aliases"
cat >"${ALIAS_FILE}" <<'ALIASES'
# git
alias git_merged='git branch --merged | grep -v "*" | grep -vE "(develop|staging|master|main|dev)"'
alias git_merged_feature='git branch --merged | grep -v "*" | grep -vE "(develop|staging|release|master|main|dev)"'
alias git_merged_delete="git_merged | git_delete"
alias git_merged_feature_delete="git_merged_feature | git_delete"
alias git_delete='xargs -I % git branch -d %'

# ls
alias ls='ls -h --color=auto'
alias ll='ls -l'
alias la='ls -a'
alias lal='la -l'
alias l1='ls -1'

# util
alias now='date "+%Y%m%d-%H%M%S"'
alias grep='grep --color=auto'
ALIASES

## bunfig.tomlより優先されてしまうので、あらかじめ設定されている環境変数を削除
unset BUN_INSTALL_BIN

## setup for profile
for shell_rc in ~/.bashrc ~/.zshrc ~/.profile; do
  touch "${shell_rc}"

  printf '\n[ -f "%s" ] && source "%s"\n' "${ALIAS_FILE}" "${ALIAS_FILE}" >>"${shell_rc}"
  printf '\nexport PATH="$PATH:~/.bun/bin"' >> "${shell_rc}"
  printf '\nexport CODEX_HOME=%s/.codex' "$(pwd)" >> "${shell_rc}"
  # ログイン後のシェルでも環境変数を削除
  printf '\nunset BUN_INSTALL_BIN' >> "${shell_rc}"
done

## install Deps
bun install -g @openai/codex
bun install
