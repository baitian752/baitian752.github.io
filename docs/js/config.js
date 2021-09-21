window.MathJax = {
  loader: {load: ['[tex]/boldsymbol']},
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true,
    packages: {'[+]': ['boldsymbol']},
    macros: {
      bm: ["{\\boldsymbol #1}", 1]
    }
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex"
  }
};
