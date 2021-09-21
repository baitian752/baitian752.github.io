---
date: 2019-10-08
tags:
  - Scheme
  - SICP
---

# Learn SICP Chapter 2

*现在到了数学抽象中最关键的一步：让我们忘记这些符号所表示的对象。……（数学家）不应在这里停步，有许多操作可以应用于这些符号，而根本不必考虑它们到底代表着什么东西。*

Hermann Weyl, *The Mathematical Way of Thinking*  
( 思维的数学方式 )
{: style="text-align: right;"}

***

**练习 2.1** 请定义出 `make-rat` 的一个更好的版本，使之可以正确处理正数和负数。当有理数为正时，`make-rat` 应当将其规范化，使它的分子和分母都是正的。如果有理数为负，那么就应只让分子为负。

```scheme
#lang sicp

(define (gcd m n)
  (if (= m 0)
      n
      (if (= n 0)
          m
          (if (> m n)
              (gcd (- m n) n)
              (gcd m (- n m))))))

(define (make-rat n d)
  (if (= d 0)
      (error "Denom cannot be 0")
      (if (= n 0)
          (cons 0 1)
          (if (and (< n 0) (< d 0))
              (make-rat (- n) (- d))
              (if (and (< n 0) (> d 0))
                  (let ((g (gcd (- n) d)))
                    (cons (/ n g) (/ d g)))
                  (if (and (> n 0) (> d 0))
                      (let ((g (gcd n d)))
                        (cons (/ n g) (/ d g)))
                      (cons (- n) (- d))))))))

(define (number x) (car x))

(define (denom x) (cdr x))

(define (add-rat x y)
  (make-rat (+ (* (number x) (denom y))
               (* (number y) (denom x)))
            (* (denom x) (denom y))))

(define (sub-rat x y)
  (make-rat (- (* (number x) (denom y))
               (* (number y) (denom x)))
            (* (denom x) (denom y))))

(define (mul-rat x y)
  (make-rat (* (number x) (number y))
            (* (denom x) (denom y))))

(define (div-rat x y)
  (make-rat (* (number x) (denom y))
            (* (number y) (denom x))))

(define (equal-rat? x y)
  (= (* (number x) (denom y))
     (* (number y) (denom x))))

(define (print-rat x)
  (newline)
  (display (number x))
  (display "/")
  (display (denom x)))

;>>> (make-rat 2 0)
;: Denom cannot be 0
;>>> (print-rat (make-rat 2 4))
;: 1/2
;>>> (print-rat (make-rat -2 4))
;: -1/2
;>>> (print-rat (make-rat 2 -4))
;: -2/4
;>>> (print-rat (make-rat -2 -4))
;: 1/2
;>>> (print-rat (add-rat (make-rat 2 4) (make-rat 4 6)))
;: 7/6
;>>> (print-rat (sub-rat (make-rat 2 4) (make-rat 4 6)))
;: -1/6
;>>> (print-rat (mul-rat (make-rat 2 4) (make-rat 4 6)))
;: 1/3
;>>> (print-rat (div-rat (make-rat 2 4) (make-rat 4 6)))
;: 3/4
;>>> (equal-rat? (make-rat 32 -128) (make-rat -13 52))
;: #t
```

***

**练习 2.2** 请考虑平面上线段的表示问题。一个线段用一对点表示，它们分别是线段的始点与终点，请定义构造函数 `make-segment` 和选择函数 `start-segment`、`end-segment`，它们基于点定义线段的表示。进而，一个点可以用数的序对表示，序对的两个成分分别表示点的 $x$ 坐标和 $y$ 坐标。请据此进一步给出构造函数 `make-point` 和选择函数 `x-point`、`y-point`，用它们定义出点的这种表示。最后，请基于所定义的构造函数和选择函数，定义出过程 `midpoint-segmant`，它以一个线段为参数，返回线段的中点（也就是那个坐标值两个端点的平均值的点）。为了试验这些过程，还需要定义一种打印点的方法：

```
(define (print-point p)
  (newline)
  (display "(")
  (display (x-point p))
  (display ",")
  (display (y-point p))
  (display ")"))
```

```scheme
#lang sicp

(define (print-point p)
  (newline)
  (display "(")
  (display (x-point p))
  (display ",")
  (display (y-point p))
  (display ")"))

(define (make-point x y)
  (cons x y))

(define (x-point p)
  (car p))

(define (y-point p)
  (cdr p))

(define (make-segment p q)
  (cons p q))

(define (start-segment s)
  (car s))

(define (end-segment s)
  (cdr s))

(define (midpoint-segment s)
  (let ((p (start-segment s))
        (q (end-segment s)))
    (cons (/ (+ (x-point p) (x-point q)) 2)
          (/ (+ (y-point p) (y-point q)) 2))))

;>>> (define p (make-point 1 2))
;>>> (define q (make-point 3 4))
;>>> (print-point p)
;: (1,2)
;>>> (define s (make-segment p q))
;>>> (define m (midpoint-segment s))
;>>> (print-point m)
;: (2,3)
```

***

**练习 2.3** 请实现一种平面矩形的表示（提示：你有可能借用 **练习 2.2** 的结果）。基于你的构造函数和选择函数定义几个过程，计算给定矩形的周长和面积等。现在请再为矩形实现另一种表示方式。你应该怎样设计系统，使之能提供适当的抽象屏蔽，使同一个周长或者面积过程对两种不同表示都能工作。

```scheme
#lang sicp

(define (make-point x y)
  (cons x y))

(define (x-point p)
  (car p))

(define (y-point p)
  (cdr p))

(define (make-rect origin angle width height)
  (cons (cons origin angle) (cons width height)))

(define (origin-rect r)
  (car (car r)))

(define (angle-rect r)
  (cdr (car r)))

(define (width-rect r)
  (car (cdr r)))

(define (height-rect r)
  (cdr (cdr r)))

(define (perimeter-rect r)
  (* 2 (+ (width-rect r)
          (height-rect r))))

(define (area-rect r)
  (* (width-rect r) (height-rect r)))

;>>> (define r (make-rect (make-point 0 0) 1.57 2 3))
;>>> (perimeter-rect r)
;: 10
;>>> (area-rect r)
;: 6
```

```scheme
#lang sicp

(define (make-point x y)
  (cons x y))

(define (x-point p)
  (car p))

(define (y-point p)
  (cdr p))

(define (distance-point p q)
  (define (sqr x) (* x x))
  (sqrt (+ (sqr (- (x-point p) (x-point q)))
           (sqr (- (y-point p) (y-point q))))))

(define (dot-product v1 v2)
  (+ (* (x-point v1) (x-point v2))
     (* (y-point v1) (y-point v2))))

(define (sub-vector v1 v2)
  (cons (- (car v1) (car v2))
        (- (cdr v1) (cdr v2))))

(define (make-rect p1 p2 p3)
  (let ((d (distance-point p2 p3)))
    (if (or (< d (distance-point p1 p2))
            (< d (distance-point p1 p3)))
        (error "Points should make a rectangle")
        (cons p1 (cons p2 p3)))))

(define (width-rect r)
  (distance-point (car r)
                  (car (cdr r))))

(define (height-rect r)
  (distance-point (car r)
                  (cdr (cdr r))))

(define (perimeter-rect r)
  (* 2 (+ (width-rect r)
          (height-rect r))))

(define (area-rect r)
  (* (width-rect r) (height-rect r)))

;>>> (define r (make-rect
;               (make-point 0 0)
;               (make-point 2 0)
;               (make-point 0 3)))
;>>>> (perimeter-rect r)
;: 10
;>>> (area-rect r)
;: 6
```

***

**练习 2.4** 下面是序对的另一种过程性表示方法。请针对这一表述验证，对于任意的 `x` 和 `y`，`(car (cons x y))` 都将产生出 `x`。

```
(define (cons x y)
  (lambda (m) (m x y)))

(define (car z)
  (z (lambda (p q) p)))
```

对应的 `cdr` 应该如何定义？（提示：为了验证这一表示确实能行，请利用 1.1.5 节的代换模型。）

```scheme
(car z)
(z (lambda (p q) p))
((cons x y) (lambda (p q) p))
((lambda (m) (m x y)) (lambda (p q) p))
((lambda (p q) p) x y)
x
```

```scheme
(define (cdr z)
  (z (lambda (p q) q)))
```

***

**练习 2.5** 请证明，如果将 $a$ 和 $b$ 的序对表示为乘积 $2^a 3^b$ 所对应的整数，我们就可以只用非负整数和算术运算表示序对。请给出对应的过程 `cons`、`car` 和 `cdr` 的定义。

```scheme
#lang sicp

(define (pow b n)
  (define (iter n r)
    (if (= n 0)
        r
        (iter (- n 1) (* b r))))
  (iter n 1))

(define (cons x y)
  (* (pow 2 x) (pow 3 y)))

(define (car z)
  (define (iter x r)
    (if (odd? x)
        r
        (iter (/ x 2) (+ r 1))))
  (iter z 0))

(define (cdr z)
  (define (get-odd x)
    (if (odd? x)
        x
        (get-odd (/ x 2))))
  (define (iter x r)
    (if (= x 1)
        r
        (iter (/ x 3) (+ r 1))))
  (iter (get-odd z) 0))

;>>> (define z (cons 618 991))
;>>> (car z)
;: 618
;>>> (cdr z)
;: 991
```

***

**练习 2.6** 如果觉得将序对表示为过程还不足以令人如雷灌顶，那么请考虑，在一个可以对过程做各种操作的语言里，我们完全可以没有数（至少在只考虑非负整数的情况下），将 $0$ 和加一操作实现为：

```
(define zero (lambda (f) (lambda (x) x)))

(define (add-1 n)
  (lambda (f) (lambda (x) (f ((n f) x)))))
```

这一表示形式称为 Church 计数名字来源于其发明人数理逻辑学家 Alonzo Church（丘奇），$\lambda$ 演算也是他发明的。

请直接定义 `one` 和 `two`（不用 `zero` 和 `add-1`）（提示：利用代换去求值（`add0-1` `zero`））。请给出加法过程 `+` 的一个直接定义（不要通过反复应用 `add-1`）。

定义 `one`，直接代入，利用 `(add-1 zero)`：

```scheme
; (define one (add-1 zero))
; (define one
;   (lambda (f) (lambda (x) (f ((zero f) x)))))
; (define one
;   (lambda (f) (lambda (x) (f (((lambda (f) (lambda (x) x)) f) x)))))
; (define one
;   (lambda (f) (lambda (x) (f ((lambda (x) x) x)))))
(define one
  (lambda (f) (lambda (x) (f x))))
```

定义 `two`，`(add-1 one)`：

```scheme
; (define two (add-1 one))
; (define two
;   (lambda (f) (lambda (x) (f ((one f) x)))))
; (define two
;   (lambda (f) (lambda (x) (f (((lambda (f) (lambda (x) (f x))) f) x)))))
; (define two
;   (lambda (f) (lambda (x) (f ((lambda (x) (f x)) x)))))
(define two
  (lambda (f) (lambda (x) (f (f x)))))
```

`n` 的定义为 `(add-1 n-1)`：

```scheme
; (define n
;   (lambda (f) (lambda (x) (f ((n-1 f) x)))))
```

`add-2` 的定义为 `(add-1 (add-1 n))`：

```scheme
; (define (add-2 n)
;   (add-1 (add-1 n)))
; (define (add-2 n)
;   (add-1 (lambda (f) (lambda (x) (f ((n f) x))))))
; (define (add-2 n)
;   (lambda (f) (lambda (x) (f (((lambda (f) (lambda (x) (f ((n f) x)))) f) x)))))
; (define (add-2 n)
;   (lambda (f) (lambda (x) (f ((lambda (x) (f ((n f) x))) x)))))
; (define (add-2 n)
;   (lambda (f) (lambda (x) (f (f ((n f) x))))))
(define (add-2 n)
  (lambda (f) (lambda (x) ((two f) ((n f) x)))))
```

假定 `add-m-1` 的定义为：

```scheme
; (define (add-m-1 n)
;   (lambda (f) (lambda (x) ((m-1 f) ((n f) x)))))
```

`add-m` 的定义为 `(add-1 (add-m-1 n))`：

```scheme
; (define (add-m n)
;   (add-1 (add-m-1 n)))
; (define (add-m n)
;   (add-1 (lambda (f) (lambda (x) ((m-1 f) ((n f) x))))))
; (define (add-m n)
;   (lambda (f) (lambda (x) (f (((lambda (f) (lambda (x) ((m-1 f) ((n f) x)))) f) x)))))
; (define (add-m n)
;   (lambda (f) (lambda (x) (f ((lambda (x) ((m-1 f) ((n f) x))) x)))))
; (define (add-m n)
;   (lambda (f) (lambda (x) (f ((m-1 f) ((n f) x))))))
; (define (add-m n)
;   (lambda (f) (lambda (x) ((m f) ((n f) x)))))
```

`+` 的定义为：

```scheme
(define (+ m n)
  (lambda (f) (lambda (x) ((m f) ((n f) x)))))
```

***

**练习 2.7** Alyssa 的程序是不完整的，因为她还没有确定区间抽象的实现。这里是区间构造符的定义：

```
(define (make-interval a b) (cons a b))
```

请定义选择符 `upper-bound` 和 `lower-bound`，完成这一实现。

```scheme
#lang sicp

(define (make-interval a b) (cons a b))

(define (upper-bound i)
  (max (car i) (cdr i)))

(define (lower-bound i)
  (min (car i) (cdr i)))

;>>> (define i (make-interval 2 3))
;>>> (upper-bound i)
;: 3
;>>> (lower-bound i)
;: 2

;>>> (define i2 (make-interval 2 -3))
;>>> (upper-bound i2)
;: 2
;>>> (lower-bound i2)
;: -3
```

***

**练习 2.8** 通过类似于 Alyssa 的推理，说明两个区间的差应该怎样计算。请定义出相应的减法过程 `sub-interval`。

把减去区间的两个端点取相反数构造新区间，然后通过加法实现减法。

```scheme
#lang sicp

(define (make-interval a b) (cons a b))

(define (upper-bound i)
  (max (car i) (cdr i)))

(define (lower-bound i)
  (min (car i) (cdr i)))

(define (add-interval x y)
  (make-interval (+ (lower-bound x) (lower-bound y))
                 (+ (upper-bound x) (upper-bound y))))

(define (inv-interval i)
  (make-interval (- (lower-bound i))
                 (- (upper-bound i))))

(define (sub-interval x y)
  (add-interval x (inv-interval y)))

```

***

**练习 2.9** 区间的宽度就是其上界和下界之差的一半。区间宽度是有关区间所描述的相应数值的非确定性的一种度量。对于某些算术运算，两个区间的组合结果的宽度就是参数区间的宽度的函数，而对其他运算，组合区间的宽度则不是参数区间宽度的函数。证明两个区间的和（与差）的宽度就是被加（或减）的区间的宽度的函数。举例说明，对于乘和除而言，情况并非如此。

说明：
- $I$ 表示区间
- $u(I)$ 表示 $I$ 的上界
- $l(I)$ 表示 $I$ 的下界
- $w(I)$ 表示 $I$ 的宽度
- $+, -, \times, /$ 可用于区间

$w(I)$ 的定义如下：

$$
w(I) = \frac{u(I) - l(I)}{2}
$$

对于加法：

$$
u(I_1 + I_2) = u(I_1) + u(I_2)
$$

$$
l(I_1 + I_2) = l(I_1) + l(I_2)
$$

因此：

$$
\begin{aligned}
  w(I_1 + I_2) &= \frac{u(I_1 + I_2) - l(I_1 + I_2)}{2} \\
  &= \frac{u(I_1) - l(I_1) + u(I_2) - l(I_2)}{2} \\
  &= w(I_1) + w(I_2)
\end{aligned}
$$

对于减法：

$$
\begin{aligned}
  w(I_1 - I_2) &= w(I_1 + （-I_2)) \\
  &= \frac{u(I_1 + (-I_2)) - l(I_1 + (-I_2))}{2} \\
  &= \frac{u(I_1) - l(I_1) + u(-I_2) - l(-I_2)}{2} \\
  &= w(I_1) + w(I_2)
\end{aligned}
$$

对于乘法，要证明不是被乘区间宽度的函数，只需证明被乘区间宽度确定时，乘积区间的宽度不定。

不妨取第一个区间为 $[0, 1]$, 第二个区间分别为 $[0, 1]$、$[1, 2]$,此时，乘积区间的宽度分别为 $0.5$、$1$，因此，乘积区间的宽度不是被乘区间宽度的函数。

对于除法，证明过程与乘法类似。

***

**练习 2.10** Ben Bitdiddle 是个专业程序员，他看了 Alyssa 工作后评论说，除以一个横跨 $0$ 的区间的意义不清楚。请修改 Alyssa 的代码，检查这种情况并在出现这一情况时报错。

```scheme
#lang sicp

(define (make-interval a b) (cons a b))

(define (upper-bound i)
  (max (car i) (cdr i)))

(define (lower-bound i)
  (min (car i) (cdr i)))

(define (mul-interval x y)
  (let ((p1 (* (lower-bound x) (lower-bound y)))
        (p2 (* (lower-bound x) (upper-bound y)))
        (p3 (* (upper-bound x) (upper-bound y)))
        (p4 (* (upper-bound x) (lower-bound y))))
    (make-interval (min p1 p2 p3 p4)
                   (max p1 p2 p3 p4))))

(define (div-interval x y)
  (if (and (> (upper-bound y) 0)
           (< (lower-bound y) 0))
      (error "Not support interval cross 0 -- Div-Interval")
      (mul-interval x
                    (make-interval (/ 1.0 (upper-bound y))
                                   (/ 1.0 (lower-bound y))))))

;>>> (define x (make-interval 1 2))
;>>> (define y (make-interval -1 1))
;>>> (div-interval x y)
;: Not support interval cross 0 -- Div-Interval

;>>> (define x2 (make-interval 1 2))
;>>> (define y2 (make-interval 3 4))
;>>> (div-interval x2 y2)
;: (0.25 . 0.6666666666666666)
```

***

**练习 2.11** 在看了这些东西之后，Ben 又说出了下面这段有些神秘的话：“通过监测区间的端点，有可能将 `mul-interval` 分解为 9 中情况，每种情况中所需的乘法都不超过两次”。请根据 Ben 的建议重写这个过程。

```scheme
#lang sicp

(define (make-interval a b) (cons a b))

(define (upper-bound i)
  (max (car i) (cdr i)))

(define (lower-bound i)
  (min (car i) (cdr i)))

(define (mul-interval x y)
  (let ((ux (upper-bound x))
        (lx (lower-bound x))
        (uy (upper-bound y))
        (ly (lower-bound y)))
    (if (<= ux 0)
        (cond ((<= uy 0)
               (make-interval (* lx ly) (* ux uy)))
              ((>= ly 0)
               (make-interval (* lx uy) (* ux ly)))
              (else
               (make-interval (* lx uy) (* lx ly))))
        (if (>= lx 0)
            (cond ((<= uy 0)
                   (make-interval (* lx uy) (* ux ly)))
                  ((>= ly 0)
                   (make-interval (* lx ly) (* ux uy)))
                  (else
                   (make-interval (* ux ly) (* ux uy))))
            (cond ((<= uy 0)
                   (make-interval (* lx ly) (* ux ly)))
                  ((>= ly 0)
                   (make-interval (* lx uy) (* ux uy)))
                  (else
                   (make-interval (max (* lx ly) (* ux uy))
                                  (min (* lx uy) (* ux ly)))))))))

;>>> (define x (make-interval 1 2))
;>>> (define y (make-interval -1 1))
;>>> (mul-interval x y)
;: (-2 . 2)

;>>> (define x2 (make-interval 1 2))
;>>> (define y2 (make-interval 3 4))
;>>> (mul-interval x2 y2)
;: (3 . 8)
```

***

**练习 2.12** 请定义一个构造函数 `make-center-percent`，它以一个中心点和一个百分比为参数，产生出所需要的区间。你还需要定义选择函数 `percent`，通过它可以得到给定区间的百分数误差，选择函数 `center` 与前面定义的一样。

```scheme
#lang sicp

(define (make-interval a b) (cons a b))

(define (upper-bound i)
  (max (car i) (cdr i)))

(define (lower-bound i)
  (min (car i) (cdr i)))

(define (center i)
  (/ (+ (lower-bound i) (upper-bound i)) 2))

(define (width i)
  (/ (- (upper-bound i) (lower-bound i)) 2))

(define (make-center-percent c p)
  (let ((w (* c p)))
    (make-interval (- c w) (+ c w))))

(define (percent i)
  (/ (width i) (center i)))

;>>> (define i (make-center-percent 2 0.1))
;>>> i
;: (1.8 . 2.2)
;>>> (center i)
;: 2.0
;>>> (width i)
;: 0.2
;>>> (percent i)
;: 0.1
```

***

**练习 2.13** 请证明，在误差为很小的百分数的条件下，存在着一个简单公式，利用它可以从两个被乘区间的误差算出乘积的百分数误差值。你可以假定所有的数为正，以简化这一问题。

假设所有的数为正，$c_1, c_2, w_1, w_2, p_1, p_2$ 分别为两个被乘区间的中点、宽度、百分比误差，$l, u, w, c$ 分别为乘积区间的下界、上界、宽度、中点，则

$$
l = (c_1 - w_1)(c_2 - w_2)
$$

$$
u = (c_1 + w_1)(c_2 + w_2)
$$

$$
w = \frac{u - l}{2}
$$

$$
c = \frac{u + l}{2}
$$

百分比误差：

$$
\begin{aligned}
  p &= \frac{w}{c} \\
  &= \frac{u - l}{u + l} \\
  &= \frac{c_1w_2 + c_2w_1}{c_1c_2 + w_1w_2} \\
  &= \frac{p_1 + p_2}{p_1p_2 + 1} \\
  &\approx p_1 + p_2 \quad (p_1 \ll 1, p_2 \ll 1)
\end{aligned}
$$

***

**练习 2.14** 请确认 Lem 是对的。请你用各种不同的算术表达式来检查这一系统的行为。请做出两个区间 $A$ 和 $B$，并用它们计算表达式 $A/A$ 和 $B/B$。如果所用区间的宽度相对于中心值取很小百分数，你将会得到更多的知识。请检查对于中心 --- 百分比形式（见 **练习 2.12**）进行计算结果。

```scheme
#lang sicp

(define (make-interval a b) (cons a b))

(define (upper-bound i)
  (max (car i) (cdr i)))

(define (lower-bound i)
  (min (car i) (cdr i)))

(define (add-interval x y)
  (make-interval (+ (lower-bound x) (lower-bound y))
                 (+ (upper-bound x) (upper-bound y))))

(define (mul-interval x y)
  (let ((p1 (* (lower-bound x) (lower-bound y)))
        (p2 (* (lower-bound x) (upper-bound y)))
        (p3 (* (upper-bound x) (upper-bound y)))
        (p4 (* (upper-bound x) (lower-bound y))))
    (make-interval (min p1 p2 p3 p4)
                   (max p1 p2 p3 p4))))

(define (div-interval x y)
  (if (and (> (upper-bound y) 0)
           (< (lower-bound y) 0))
      (error "Not support interval cross 0 -- Div-Interval")
      (mul-interval x
                    (make-interval (/ 1.0 (upper-bound y))
                                   (/ 1.0 (lower-bound y))))))

(define (center i)
  (/ (+ (lower-bound i) (upper-bound i)) 2))

(define (width i)
  (/ (- (upper-bound i) (lower-bound i)) 2))

(define (make-center-percent c p)
  (let ((w (* c p)))
    (make-interval (- c w) (+ c w))))

(define (percent i)
  (/ (width i) (center i)))

(define (par1 r1 r2)
  (div-interval (mul-interval r1 r2)
                (add-interval r1 r2)))

(define (par2 r1 r2)
  (let ((one (make-interval 1 1)))
    (div-interval one
                  (add-interval (div-interval one r1)
                                (div-interval one r2)))))

;>>> (define r1 (make-interval 0.9 1.1))
;>>> (define r2 (make-interval 0.9 1.1))
;>>> (par1 r1 r2)
;: (0.3681818181818182 . 0.6722222222222224)
;>>> (par2 r1 r2)
;: (0.44999999999999996 . 0.55)

;>>> (define A (make-center-percent 1.0 0.05))
;>>> (define B (make-center-percent 1.0 0.1))
;>>> (define q1 (div-interval A A))
;>>> (define q2 (div-interval A B))
;>>> (center q1)
;: 1.0050125313283207
;>>> (percent q1)
;: 0.09975062344139651
;>>> (center q2)
;: 1.0151515151515151
;>>> (percent q2)
;: 0.14925373134328368
```

***

**练习 2.15** 另一用户 Eva Lu Ator 也注意到了由不同的等价代数表达式计算出的区间的差异。她说，如果一个公式可以写成一种形式，其中具有非准确性的变量不重复出现，那么 Alyssa 的系统产生出的区间的限界更紧一些。她说，因此，在计算并联电阻时，`par2` 是比 `par1`“更好的”程序。她说得对吗？

对，设 $R_1$ 的区间为 $[a_1, b_1] (a_1 \le b_1)$，$R_2$ 的区间为 $[a_2, b_2] (a_2 \le b_2)$，则 `par1` 的结果为：

$$
\left[\frac{a_1a_2}{b_1+b_2}, \frac{b_1b_2}{a_1+a_2}\right]
$$

`par2` 的结果为：

$$
\left[\frac{a_1a_2}{a_1+a_2}, \frac{b_1b_2}{b_1+b_2}\right]
$$

显然，`par2` 计算所得的区间宽度不会大于 `par1`。

***

**练习 2.16** 请给出一个一般性的解释：为什么等价的代数表达式可能导致不同计算结果？你能设计出一个区间算术包，使之没有这种缺陷吗？或者这件事情根本不可能做到？（警告：这个问题非常难。）

在 **练习 2.14** 中，$A/A$ 的结果并不是 $1$，原因是对于给定的区间算术运算规则，没有考虑分子和分母的 $A$ 其实是同一个量，始终只能取一样的数值。再比如，将 $\frac{R_1R_2}{R_1 + R_2}$ 中的分母上的 $R_1, R_2$ 分别替换成与 $R_1, R_2$ 相同区间的 $R_3, R_4$，此时

$$
  \frac{R_1R_2}{R_1 + R_2} = \frac{R_1R_2}{R_3 + R_4}
$$

而 $\frac{R_1R_2}{R_3 + R_4}$ 与 $\frac{1}{1/R_1 + 1/R_2}$ 不存在“等价”关系，便说明了问题。

### ***TODO***

***

**练习 2.17** 请定义出过程 `last-pair`，它返回只包含给定（非空）表里最后一个元素的表：

```
(last-pair (list 23 72 149 34))
(34)
```

```scheme
#lang sicp

(define (last-pair l)
  (if (null? (cdr l))
      l
      (last-pair (cdr l))))

;>>> (last-pair (list 23 72 149 34))
;: (34)
```

***

**练习 2.18** 请定义出过程 `reverse`，它以一个表为参数，返回的表中所包含的元素与参数表相同，但排列顺序与参数表相反：

```
(reverse (list 1 4 9 16 25))
(25 16 9 4 1)
```

```scheme
#lang sicp

(define (reverse l)
  (define (reverse-iter lst r)
    (if (null? lst)
        r
        (reverse-iter (cdr lst) (cons (car lst) r))))
  (reverse-iter l nil))

;>>> (reverse (list 1 4 9 16 25))
;: (25 16 9 4 1)
```

***

**练习 2.19** 请考虑 1.2.2 节的兑换零钱方式计数程序。如果能够轻而易举地改变程序里所用的兑换币种就更好了。譬如说，那样我们就能计算出 1 英镑的不同兑换方式的数目。在写前面那个程序时，有关币种的知识中有一部分出现在过程 `first-denomination` 里，另一部分出现在过程里 `count-change`（它知道有 5 种 U.S. 硬币）。如果能够用一个表来提供可用于兑换的硬币就更好了。

我们希望重写出过程 `cc`，使其第二个参数是一个可用硬币的币值表，而不是一个指定可用硬币种类的整数。而后我们就可以针对各种货币定义出一些表：

```
(define us-coins (list 50 25 10 5 1))

(define uk-coins (list 100 50 20 10 5 2 1 0.5))
```

然后我们就可以通过如下方式调用 `cc`：

```
(cc 100 us-coins)
292
```

为了做到这件事，我们需要对程序 `cc` 做一些修改。它仍然具有同样的形式，但将以不同的方式访问自己的第二个参数，如下面所示：

```
(define (cc amount coin-values)
  (cond ((= amount 0) 1)
        ((or (< amount 0) (no-more? coin-values)) 0)
        (else
         (+ (cc amount
                (except-first-denomination coin-values))
            (cc (- amount
                   (first-denomination coin-values))
                coin-values)))))
```

请基于表结构上的基本操作，定义出过程 `first-denomination`、`except-first-denomination` 和 `no-more?`。表 `coin-values` 的排列顺序会影响 `cc` 给出的回答吗？为什么？

```scheme
#lang sicp

(define us-coins (list 50 25 10 5 1))

(define uk-coins (list 100 50 20 10 5 2 1 0.5))

(define (cc amount coin-values)
  (cond ((= amount 0) 1)
        ((or (< amount 0) (no-more? coin-values)) 0)
        (else
         (+ (cc amount
                (except-first-denomination coin-values))
            (cc (- amount
                   (first-denomination coin-values))
                coin-values)))))

(define (except-first-denomination coin-values)
  (cdr coin-values))

(define (first-denomination coin-values)
  (car coin-values))

(define (no-more? coin-values)
  (null? coin-values))

;>>> (cc 100 us-coins)
;: 292
;>>> (cc 100 uk-coins)
;: 104561
```

表 `coin-values` 的排列顺序不会影响 `cc` 给出的回答，因为 `cc` 会遍历给定 `coin-values` 中所有的可能兑换零钱方式。

***

**练习 2.20** 过程 `+`、`*` 和 `list` 可以取任意个数的实际参数。定义这类过程的一种方式是采用一种带点尾部记法形式的 `define`。在一个过程定义中，如果在形式参数表的最后一个参数之前有一个点号，那就表明，当这一过程被实际调用时，前面各个形式参数（如果有的话）将以前面的各个实际参数为值，与平常一样。但最后一个形式参数将以所有剩下的实际参数的表为值。例如，假若我们定义了：

```
(define (f x y . z) <body>)
```

过程 `f` 就可以用两个以上的参数调用。如果求值：

```
(f 1 2 3 4 5 6)
```

那么在 `f` 的体里， `x` 将是 $1$，`y` 将是 $2$，而 `z` 将是表 `(3 4 5 6)`。给了定义：

```
(define (g . w) <body>)
```

过程 `g` 可以用 0 个或多个参数调用。如果求值：

```
(g 1 2 3 4 5 6)
```

那么在 `g` 的体里，`w` 将是表 `(1 2 3 4 5 6)`。

请采用这种记法形式写出过程 `same-parity`，它以一个或者多个整数为参数，返回所有与其第一个参数有着同样奇偶性的参数形成的表。例如：

```
(same-parity 1 2 3 4 5 6 7)
(1 3 5 7)

(same-parity 2 3 4 5 6 7)
(2 4 6)
```

```scheme
#lang sicp

(define (reverse l)
  (define (reverse-iter lst r)
    (if (null? lst)
        r
        (reverse-iter (cdr lst) (cons (car lst) r))))
  (reverse-iter l nil))

(define (same-parity k . n)
  (define (iter n r)
    (if (null? n)
        r
        (iter (cdr n)
              (if (or (and (even? k) (even? (car n)))
                      (and (odd? k) (odd? (car n))))
                  (cons (car n) r)
                  r))))
  (reverse (iter n (list k))))

;>>> (same-parity 1 2 3 4 5 6 7)
;: (1 3 5 7)
;>>> (same-parity 2 3 4 5 6 7)
;: (2 4 6)
```

***

**练习 2.21** 过程 `square-list` 以一个数值表为参数，返回每个数的平方构成的表：

```
(square-list (list 1 2 3 4))
(1 4 9 16)
```

下面是 `square-list` 的两个定义，请填充其中缺少的表达式以完成它们：

```
(define (square-list items)
  (if (null? items)
      nil
      (cons <??> <??>)))

(define (square-list items)
  (map <??> <??>))
```

```scheme
#lang sicp

(define (square x) (* x x))

(define (square-list items)
  (if (null? items)
      nil
      (cons (square (car items))
            (square-list (cdr items)))))

(define (square-list-2 items)
  (map square items))

;>>> (square-list (list 1 2 3 4))
;: (1 4 9 16)
;>>> (square-list-2 (list 1 2 3 4))
;: (1 4 9 16)
```

***

**练习 2.22** Louis Reasoner 试图重写 **练习 2.21** 的第一个 `square-list` 过程，希望使它能生成一个迭代计算过程：

```
(define (square-list items)
  (define (iter things answer)
    (if (null? things)
        answer
        (iter (cdr things)
              (cons (square (car things))
                    answer))))
  (iter items nil))
```

但是很不幸，在按这种方式定义出的 `square-list` 产生出的结果表中，元素的顺序正好与我们所需要的相反。为什么？

Louis 又试着修正其程序，交换了 `cons` 的参数：

```
(define (square-list items)
  (define (iter things answer)
    (if (null? things)
        answer
        (iter (cdr things)
              (cons answer
                    (square (car things))))))
  (iter items nil))
```

但还是不行。请解释为什么。

前者是因为在用 `cons` 构造 list 的时候，是从最后一个元素开始往前面构造，因此顺序刚好相反。

后者不符合 `cons` 构造 list 的规则，`cons` 构造 list 的话，第一个参数为一个元素，第二个为一个 list（或者 `nil`）。

***

**练习 2.23** 过程 `for-each` 与 `map` 类似，它以一个过程和一个元素表为参数，但它并不返回结果测表，只是将这一过程从左到右应用于各个元素，将过程应用于元素得到的值都丢掉不用。`for-each` 通常用于那些执行了某些动作的过程，如打印等。看下面例子：

```
(for-each (lambda (x) (newline) (display x))
          (list 57 321 88))
57
321
88
```

由 `for-each` 的调用返回的值（上面没有显示）可以是某种任意的东西，例如逻辑值真。请给出一个 `for-each` 的实现。

```scheme
#lang sicp

(define (for-each proc items)
  (cond ((not (null? items))
         (proc (car items))
         (for-each proc (cdr items)))))

;>>> (for-each (lambda (x) (newline) (display x))
;>>>           (list 57 321 88))
;:
;: 57
;: 321
;: 88
```

***

**练习 2.24** 假定现在要求值表达式 `(list 1 (list 2 (list 3 4)))`，请给出由解释器打印出的结果，给出与之对应的盒子指针结构，并将它解释为一棵树（参见图 2-6）。

```
(1 (2 (3 4)))
```

![image]({{ image_path('2.24-1.svg') }})
{: style="margin: 0 auto; width: 60%;"}

![image]({{ image_path('2.24-2.svg') }})
{: style="margin: 0 auto; width: 40%;"}

***

**练习 2.25** 给出能够从下面各表中取出 7 的 `car` 和 `cdr` 组合：

```
(1 3 (5 7) 9)

((7))

(1 (2 (3 (4 (5 (6 7))))))
```

```scheme
#lang sicp

(car (cdr (car (cdr (cdr (list 1 3 (list 5 7) 9))))))

(car (car (list (list 7))))

(car (cdr (car (cdr (car (cdr (car (cdr (car (cdr (car (cdr (list 1 (list 2 (list 3 (list 4 (list 5 (list 6 7))))))))))))))))))
```

***

**练习 2.26** 假定已将 `x` 和 `y` 定义为如下的两个表：

```
(define x (list 1 2 3))

(define y (list 4 5 6))
```

解释器对于下面各个表达式将打印出什么结果：

```
(append x y)

(cons x y)

(list x y)
```

```
(1 2 3 4 5 6)

((1 2 3) 4 5 6)

((1 2 3) (4 5 6))
```

***

**练习 2.27** 请修改 **练习 2.18** 中所做的 `reverse` 过程，得到一个 `deep-reverse` 过程。它以一个表为参数，返回另一个表作为值，结果表中的元素反过来，其中的子树也反转。例如：

```
(define x (list 1 2) (list 3 4))

x
((1 2) (3 4))

(reverse x)
((3 4) (1 2))

(deep-reverse x)
((4 3) (2 1))
```

```scheme
#lang sicp

(define (deep-reverse l)
  (define (iter lst r)
    (cond ((null? lst) r)
          ((pair? (car lst)) (iter (cdr lst) (cons (iter (car lst) nil) r)))
          (else (iter (cdr lst) (cons (car lst) r)))))
  (iter l nil))
  
(define x (list (list 1 2) (list 3 4)))

(deep-reverse x)
```

***

**练习 2.28** 写一个过程 `fringe`，它以一个树（表示为表）为参数，返回一个表，表中的元素是这棵树的所有树叶，按照从左到右的顺序。例如：

```
(define x (list (list 1 2) (list 3 4)))

(fringe x)
(1 2 3 4)

(fringe (list x x))
(1 2 3 4 1 2 3 4)
```

```scheme
#lang sicp

(define (fringe l)
  (define (iter lst r)
    (cond ((null? lst) r)
          ((pair? (car lst)) (append (iter (car lst) nil)
                                     (iter (cdr lst) r)))
          (else (iter (cdr lst) (append r (list (car lst)))))))
  (iter l nil))


;>>> (define x (list (list 1 2) (list 3 4)))

;>>> (fringe x)
;: (1 2 3 4)

;>>> (fringe (list x x))
;: (1 2 3 4 1 2 3 4)
```

***

**练习 2.29** 一个二叉活动体由两个分支组成，一个是左分支，另一个是右分支，每个分支是一个具有确定长度的杆，上面或者吊着一个重量，或者吊着另一个二叉活动体。我们可以用复合数据对象表示这种二叉活动体，将它通过其两个分支构造起来（例如，使用 `list`）：

```
(define (make-mobile left right)
  (list left right))
```

分支可以从一个 `length`（它应该是一个数）再加上一个 `structure` 构造出来，这个 `structure` 或者是一个数（表示一个简单重量），或者是另一个活动体：

```
(define (make-branch length structure)
  (list length structure))
```

a) 请写出相应的选择函数 `left-branch` 和 `right-branch`，它们分别返回活动体的两个分支。还有 `branch-length` 和 `branch-structure`，它们返回一个分支上的成分。

b) 用你的选择函数定义过程 `total-weight`，它返回一个活动体的总重量。

c) 一个活动体称为是平衡的，如果其左分支的力矩等于其右分支的力矩（也就是说，如果其左杆的长度乘以吊在杆上的重量，等于这个活动体右边的同样乘积），而且在其每个分支上吊着的子活动体也都平衡。请设计一个过程，它能检查一个活动体是否平衡。

d) 假定我们改变活动体的表示，采用下面构造方式：

```
(define (make-mobile left right)
  (cons left right))

(define (make-branch length structure)
  (cons length structure))
```

你需要对自己的程序做多少修改，才能将它改为使用这种新表示？

```scheme
#lang sicp

(define (make-mobile left right)
  (list left right))

(define (make-branch length structure)
  (list length structure))

(define (left-branch m)
  (car m))

(define (right-branch m)
  (car (cdr m)))

(define (branch-length b)
  (car b))

(define (branch-structure b)
  (car (cdr b)))

(define (total-weight m)
  (if (pair? m)
      (+ (total-weight (branch-structure (left-branch m)))
         (total-weight (branch-structure (right-branch m))))
      m))

(define (mobile-balance? m)
  (if (not (pair? m))
      #t
      (let ((lb (left-branch m))
            (rb (right-branch m)))
        (and (mobile-balance? (branch-structure lb))
             (mobile-balance? (branch-structure rb))
             (= (* (branch-length lb)
                   (total-weight (branch-structure lb)))
                (* (branch-length rb)
                   (total-weight (branch-structure rb))))))))

;>>> (define m (make-mobile
;>>>            (make-branch 30 10)
;>>>            (make-branch 10 (make-mobile (make-branch 10 20)
;>>>                                         (make-branch 20 10)))))
;>>> (total-weight m)
;: 40
;>>> (mobile-balance? m)
;: #t

;>>> (define m2 (make-mobile
;>>>             (make-branch 20 (make-mobile (make-branch 20 10)
;>>>                                          (make-branch 10 30)))
;>>>             (make-branch 10 (make-mobile (make-branch 10 20)
;>>>                                          (make-branch 20 10)))))
;>>> (total-weight m2)
;: 70
;>>> (mobile-balance? m2)
;: #f
```

```scheme
#lang sicp

(define (make-mobile left right)
  (cons left right))

(define (make-branch length structure)
  (cons length structure))

(define (left-branch m)
  (car m))

(define (right-branch m)
  (cdr m))

(define (branch-length b)
  (car b))

(define (branch-structure b)
  (cdr b))
```

***

**练习 2.30** 请定义一个与 **练习 2.21** 中 `square-list` 过程类似的 `square-tree` 过程。也就是说，它应该具有下面的行为：

```
(square-tree
 (list 1
       (list 2 (list 3 4) 5)
       (list 6 7)))
(1 (4 (9 16) 25) (36 49))
```

请以两种方式定义 `square-tree`，直接定义（即不使用任何高阶函数），以及使用 `map` 和递归定义。

```scheme
#lang sicp

(define (square-tree tree)
  (cond ((null? tree) nil)
        ((not (pair? tree)) (* tree tree))
        (else (cons (square-tree (car tree))
                    (square-tree (cdr tree))))))

(define (square-tree2 tree)
  (map (lambda (sub-tree)
         (if (not (pair? sub-tree))
             (* sub-tree sub-tree)
             (square-tree2 sub-tree)))
       tree))

;>>> (square-tree
;>>>  (list 1
;>>>        (list 2 (list 3 4) 5)
;>>>        (list 6 7)))
;: (1 (4 (9 16) 25) (36 49))

;>>> (square-tree2
;>>>  (list 1
;>>>        (list 2 (list 3 4) 5)
;>>>        (list 6 7)))
;: (1 (4 (9 16) 25) (36 49))
```

***

**练习 2.31** 将你在 **练习 2.30** 做出的解答进一步抽象，做出一个过程，使它的性质保证能以下面形式定义 `square-tree`：

```
(define (square-tree tree) (tree-map square tree))
```

```scheme
#lang sicp

(define (tree-map proc tree)
  (map (lambda (sub-tree)
         (if (not (pair? sub-tree))
             (proc sub-tree)
             (tree-map proc sub-tree)))
       tree))

(define (square x) (* x x))

(define (square-tree tree) (tree-map square tree))

;>>> (square-tree
;>>>  (list 1
;>>>        (list 2 (list 3 4) 5)
;>>>        (list 6 7)))
;: (1 (4 (9 16) 25) (36 49))
```

***

**练习 2.32** 我们可以将一个集合表示为一个元素互不相同的表，因此就可以将一个集合的所有子集表示为表的表。例如，假定集合为 `(1 2 3)`，它的所有子集的集合就是 `(() (3) (2) (2 3) (1) (1 3) (1 2) (1 2 3))`。请完成下面的过程定义，它生成出一个集合的所有子集的集合。请解释它为什么能完成这一工作。

```
(define (subsets s)
  (if (null? s)
      (list nil)
      (let ((rest (subsets (cdr s))))
        (append rest (map <??> rest)))))
```

```scheme
#lang sicp

(define (subsets s)
  (if (null? s)
      (list nil)
      (let ((rest (subsets (cdr s))))
        (append rest (map
                      (lambda (e) (cons (car s) e))
                      rest)))))

;>>> (subsets (list 1 2 3))
;: (() (3) (2) (2 3) (1) (1 3) (1 2) (1 2 3))
```

首先，`rest` 表示集合 `s` 不含 `(car s)` 的所有子集，而含 `(car s)` 的子集刚好是 `rest` 中每个集合添加元素 `(car s)`，将二者拼接，便得到 `s` 的所有子集。

***

**练习 2.33** 请填充下面缺失的表达式，完成将一些基本的表操作看作累积的定义：

```
(define (map p sequence)
  (accumulate (lambda (x y) <??>) nil sequence))

(define (append seq1 seq2)
  (accumulate cons <??> <??>))

(define (length sequence)
  (accumulate <??> 0 sequence))
```

```scheme
#lang sicp

(define (accumulate op initial sequence)
  (if (null? sequence)
      initial
      (op (car sequence)
          (accumulate op initial (cdr sequence)))))

(define (map p sequence)
  (accumulate (lambda (x y) (cons (p x) y)) nil sequence))

(define (append seq1 seq2)
  (accumulate cons seq2 seq1))

(define (length sequence)
  (accumulate (lambda (x y) (+ 1 y)) 0 sequence))

;>>> (map (lambda (x) (+ 1 x)) (list 1 2 3))
;: (2 3 4)

;>>> (append (list 1 2 3) (list 4 5 6))
;: (1 2 3 4 5 6)

;>>> (length (list 1 2 3))
;: 3
```

***

**练习 2.34** 对于 $x$ 的某个给定值，求出一个多项式在 $x$ 的值，也可以形式化为一种累积。假定需要求下面多项式的值：

$$
a_nx^n + a_{n-1}x^{n-1} + \cdots + a_1x + a_0
$$

采用著名的 Horner 规则，可以构造出下面的计算：

$$
(\cdots (a_nx + a_{n-1})x + \cdots + a_1)x + a_0
$$

换句话说，我们可以从 $a_n$ 开始，乘以 $x$，再加上 $a_{n-1}$，乘以 $x$，如此下去，知道处理完 $a_0$。请填充下面的模板，做出一个利用 Horner 规则求多项式值的过程。假定多项式的系数安排在一个序列里，从 $a_0$ 直至 $a_n$。

```
(define (horner-eval x coefficient-sequence)
  (accumulate (lambda (this-coeff higher-terms) <??>)
              0
              coefficient-sequence))
```

例如，为了计算 $1 + 3x + 5x^3 + x^5$ 在 $x = 2$ 的值，你需要求值：

```
(horner-eval 2 (list 1 3 0 5 0 1))
```

```scheme
#lang sicp

(define (accumulate op initial sequence)
  (if (null? sequence)
      initial
      (op (car sequence)
          (accumulate op initial (cdr sequence)))))

(define (horner-eval x coefficient-sequence)
  (accumulate (lambda (this-coeff higher-terms)
                (+ this-coeff (* x higher-terms)))
              0
              coefficient-sequence))

;>>> (horner-eval 2 (list 1 3 0 5 0 1))
;: 79
```

***

**练习 2.35** 将 2.2.2 节的 `count-leaves` 重新定义为一个累积：

```
(define (count-leaves t)
  (accumulate <??> <??> (map <??> <??>)))
```

```scheme
#lang sicp

(define (accumulate op initial sequence)
  (if (null? sequence)
      initial
      (op (car sequence)
          (accumulate op initial (cdr sequence)))))

(define (count-leaves t)
  (accumulate (lambda (x y) (+ x y))
              0
              (map
               (lambda (s)
                 (if (pair? s)
                     (count-leaves s)
                     1))
               t)))

(count-leaves (list 1 (list 2 (list 3 4))))
```

***

**练习 2.36** 过程 `accumulate-n` 与 `accumulate` 类似，除了它的第三个参数是一个序列的序列，假定其中每个序列的元素个数相同。它用指定的累积过程去组合起所有序列的第一个元素，而后是所有序列的第二个元素，并如此做下去，返回得到的所有结果的序列。例如，如果 `s` 是包含着 4 个序列的序列 `((1 2 3) (4 5 6) (7 8 9) (10 11 12))`，那么 `(accumulate-n + 0 s)` 的值就应该是序列 `(22 26 30)`。请填充下面 `accumulate-n` 定义中所缺失的表达式：

```
(define (accumulate-n op init seqs)
  (if (null? (car seqs))
      nil
      (cons (accumulate op init <??>)
            (accumulate-n op init <??>))))
```

```scheme
#lang sicp

(define (accumulate op initial sequence)
  (if (null? sequence)
      initial
      (op (car sequence)
          (accumulate op initial (cdr sequence)))))

(define (accumulate-n op init seqs)
  (if (null? (car seqs))
      nil
      (cons (accumulate op init (map (lambda (s) (car s)) seqs))
            (accumulate-n op init (map (lambda (s) (cdr s)) seqs)))))

;>>> (define s (list (list 1 2 3) (list 4 5 6) (list 7 8 9) (list 10 11 12)))

;>>> (accumulate-n + 0 s)
;: (22 26 30)
```

***

**练习 2.37** 假定我们将向量 $v = (v_i)$ 表示为数的序列，将矩阵 $m = (m_{ij})$ 表示为向量（矩阵行）的序列。例如，矩阵：

$$
\begin{bmatrix}
  1 & 2 & 3 & 4 \\
  4 & 5 & 6 & 6 \\
  6 & 7 & 8 & 9 \\
\end{bmatrix}
$$

用序列 `((1 2 3 4) (4 5 6 6) (6 7 8 9))` 表示。对于这种表示，我们可以用序列操作简洁地表达基本的矩阵与向量运算。这些运算（任何有关矩阵代数的书里都有描述）如下：

`(dot-product v w)` | 返回和 $\sum_i v_i w_i$;  
`(matrix-*-vector m v)` | 返回向量 $t$，其中 $t_i = \sum_j m_{ij} v_j$;  
`(matrix-*-matrix m n)` | 返回矩阵 $p$，其中 $p_{ij} = \sum_k m_{ik} n_{kj}$;  
`(transpose m)` | 返回矩阵 $n$，其中 $n_{ij} = m_{ji}$;  

我们可以将点积（dot product）定义为：

```
(define (dot-product v w)
  (accumulate + 0 (map * v w)))
```

请填充下面过程里缺失的表达式，它们计算出其他的矩阵运算结果（过程 `accumulate-n` 在 **练习 2.36** 中定义）。

```
(define (matrix-*-vector m v)
  (map <??> m))

(define (transpose mat)
  (accumulate-n <??> <??> mat))

(define (matrix-*-matrix m n)
  (let ((cols (transpose n)))
    (map <??> m)))
```

```scheme
#lang sicp

(define (accumulate op initial sequence)
  (if (null? sequence)
      initial
      (op (car sequence)
          (accumulate op initial (cdr sequence)))))

(define (accumulate-n op init seqs)
  (if (null? (car seqs))
      nil
      (cons (accumulate op init (map (lambda (s) (car s)) seqs))
            (accumulate-n op init (map (lambda (s) (cdr s)) seqs)))))

(define (dot-product v w)
  (accumulate + 0 (map * v w)))

(define (matrix-*-vector m v)
  (map (lambda (row) (dot-product row v)) m))

(define (transpose mat)
  (accumulate-n cons nil mat))

(define (matrix-*-matrix m n)
  (let ((cols (transpose n)))
    (map (lambda (row) (matrix-*-vector cols row)) m)))

;>>> (define v (list 1 2 3 4))

;>>> (define w (list 5 6 7 8))

;>>> (define m (list (list 1 2 3 4) (list 4 5 6 6) (list 6 7 8 9)))

;>>> (dot-product v w)
;: 70

;>>> (matrix-*-vector m v)
;: (30 56 80)

;>>> (matrix-*-matrix m (transpose m))
;: ((30 56 80) (56 113 161) (80 161 230))

;>>> (matrix-*-matrix (transpose m) m)
;: ((53 64 75 82) (64 78 92 101) (75 92 109 120) (82 101 120 133))
```

***

**练习 2.38** 过程 `accumulate` 也称为 `fold-right`，因为它将序列的第一个元素组合到右边所有元素的组合结果上。也有一个 `fold-left`，它与 `fold-right` 类似，但却是按照相反方向去操作各个元素：

```
(define (fold-left op initial sequence)
  (define (iter result rest)
    (if (null? rest)
        result
        (iter (op result (car rest))
              (cdr rest))))
  (iter initial sequence))
```

下面表达式的值是什么？

```
(fold-right / 1 (list 1 2 3))

(fold-left / 1 (list 1 2 3))

(fold-right list nil (list 1 2 3))

(fold-left list nil (list 1 2 3))
```

如果要求用某个 `op` 时保证 `fold-right` 和 `fold-left` 对任何序列都产生同样的结果，请给出 `op` 应该满足的性质。

```
3/2

1/6

(3 (2 (1 ())))

(((() 1) 2) 3)
```

要求用某个 `op` 时保证 `fold-right` 和 `fold-left` 对任何序列都产生同样的结果的话，`op` 应满足交换律，即 `(op a b) = (op b a)`。

***

**练习 2.39** 基于 **练习 2.38** 的 `fold-right` 和 `fold-left` 完成 `reverse` （**练习 2.18**）下面的定义：

```
(define (reverse sequence)
  (fold-right (lambda (x y) <??>) nil sequence))

(define (reverse sequence)
  (fold-left (lambda (x y) <??>) nil sequence))
```

```scheme
#lang sicp

(define (fold-left op initial sequence)
  (define (iter result rest)
    (if (null? rest)
        result
        (iter (op result (car rest))
              (cdr rest))))
  (iter initial sequence))

(define (fold-right op initial sequence)
  (define (iter result rest)
    (if (null? rest)
        result
        (iter (op (car rest) result)
              (cdr rest))))
  (iter initial sequence))

(define (reverse sequence)
  (fold-right (lambda (x y) (cons x y)) nil sequence))

(define (reverse2 sequence)
  (fold-left (lambda (x y) (cons y x)) nil sequence))

;>>> (reverse (list 1 2 3 4))
;: (4 3 2 1)

;>>> (reverse2 (list 1 2 3 4))
;: (4 3 2 1)
```

***

**练习 2.40** 请定义过程 `unique-pairs`，给它整数 $n$，它产生出序列 $(i, j)$，其中 $1 \le j \lt i \le n$。请用 `unique-pairs` 去简化上面 `prime-sum-pairs` 的定义。

```scheme
#lang sicp

(define (filter predicate sequence)
  (cond ((null? sequence) nil)
        ((predicate (car sequence))
         (cons (car sequence)
               (filter predicate (cdr sequence))))
        (else (filter predicate (cdr sequence)))))

(define (enumerate-interval m n)
  (if (> m n)
      nil
      (cons m (enumerate-interval (+ 1 m) n))))

(define (unique-pairs n)
  (if (<= n 1)
      nil
      (append (map (lambda (j) (list n j))
                   (enumerate-interval 1 (- n 1)))
              (unique-pairs (- n 1)))))

(define (prime? n)
  (define (smallest-divisor n)
    (find-divisor n 2))
  (define (find-divisor n test-divisor)
    (cond ((> (square test-divisor) n) n)
          ((divides? test-divisor n) test-divisor)
          (else (find-divisor n (+ test-divisor 1)))))
  (define (square x) (* x x))
  (define (divides? a b)
    (= (remainder b a) 0))
  (= (smallest-divisor n) n))

(define (prime-sum-pairs n)
  (filter (lambda (p)
            (prime? (+ (car p) (cadr p))))
          (unique-pairs n)))

;>>> (prime-sum-pairs 6)
;: ((6 1) (6 5) (5 2) (4 1) (4 3) (3 2) (2 1))
```

***

**练习 2.41** 请写出一个过程，它能产生出所有小于等于给定整数 $n$ 的正的相异整数 $i$、$j$ 和 $k$ 的有序三元组，使每个三元组的三个元素之和等于给定的整数 $s$。

```scheme
#lang sicp

(define (filter predicate sequence)
  (cond ((null? sequence) nil)
        ((predicate (car sequence))
         (cons (car sequence)
               (filter predicate (cdr sequence))))
        (else (filter predicate (cdr sequence)))))

(define (accumulate op initial sequence)
  (if (null? sequence)
      initial
      (op (car sequence)
          (accumulate op initial (cdr sequence)))))

(define (flatmap proc seq)
  (accumulate append nil (map proc seq)))

(define (enumerate-interval m n)
  (if (> m n)
      nil
      (cons m (enumerate-interval (+ 1 m) n))))

(define (unique-triples n)
  (if (<= n 2)
      nil
      (append (flatmap (lambda (j)
                         (map (lambda (k) (list n j k))
                              (enumerate-interval 1 (- j 1))))
                       (enumerate-interval 2 (- n 1)))
              (unique-triples (- n 1)))))

(define (permute-triples seqs)
  (flatmap (lambda (seq)
             (let ((a (car seq))
                   (b (cadr seq))
                   (c (caddr seq)))
               (list (list a b c)
                     (list a c b)
                     (list b c a)
                     (list b a c)
                     (list c a b)
                     (list c b a))))
           seqs))
  
(define (triple-sum n s)
  (permute-triples (filter (lambda (triple)
                             (= s
                                (+ (car triple)
                                   (cadr triple)
                                   (caddr triple))))
                           (unique-triples n))))

;>>> (triple-sum 10 7)
;: ((4 2 1) (4 1 2) (2 1 4) (2 4 1) (1 4 2) (1 2 4))

;>>> (triple-sum 10 9)
;: ((6 2 1) (6 1 2) (2 1 6) (2 6 1) (1 6 2) (1 2 6) (5 3 1) (5 1 3) (3 1 5) (3 5 1) (1 5 3) (1 3 5) (4 3 2) (4 2 3) (3 2 4) (3 4 2) (2 4 3) (2 3 4))
```

***

**练习 2.42** “八皇后谜题”问的是怎样将八个皇后摆在国际象棋棋盘上，使得任意一个皇后都不能攻击另一个皇后（也就是说，任意两个皇后都不在同一行、同一列或者同一对角线上）。一个可能的解如图 2-8 所示。解决这一谜题的一种方法按一个方向处理棋盘，每次在每一列里放一个皇后，如果现在已经放好了 $k-1$ 个皇后，第 $k$ 个皇后就必须放在不会被已在棋盘上的任何皇后攻击的位置上。我们可以递归地描述这一过程：假定我们已经生成了在棋盘的前 $k-1$ 列中放置 $k-1$ 个皇后的所有可能方式，现在需要的就是对于其中的每种方式，生成出将下一个皇后放在第 $k$ 列中每一行的扩充集合。而后过滤它们，只留下能使位于第 $k$ 列的皇后与其他皇后相安无事的那些扩充。这样就能产生出将 $k$ 个皇后放置在前 $k$ 列的所有格局的序列。继续这一过程，我们将能产生出这一谜题的所有解，而不是一个解。

将这一解法实现为一个过程 `queens`，令它返回在 $n\times n$ 棋盘上放 $n$ 个皇后的所有解的序列。`queens` 内部的过程 `queen-cols`，返回在棋盘的前 $k$ 列中放皇后的所有格局的序列。

![image]({{ image_path('2.42.svg') }})
**图 2-8**： 八皇后谜题的一个解
{: style="margin: 0 auto; width: 50%; text-align: center;"}

```
(define (queens board-size)
  (define (queen-cols k)
    (if (= k 0)
        (list empty-board)
        (filter
         (lambda (positions) (safe? k positions))
         (flatmap
          (lambda (rest-of-queens)
            (map (lambda (new-row)
                   (adjoin-position new-row k rest-of-queens))
                 (enumerate-interval 1 board-size)))
          (queen-cols (- k 1))))))
  (queen-cols board-size))
```

这个过程里的 `rest-of-queens` 是在前 $k-1$ 列放置 $k-1$ 个皇后的一种方式，`new-row` 是在第 $k$ 列放置所考虑的行编号。请完成这一程序，为此需要实现一种棋盘格局集合的表示方法；还要实现过程 `adjoin-position`，它将一个新的行列格局加入一个格局集合中，在第 $k$ 列的皇后相对于其他列的皇后是否为安全的（请注意，我们只需检查新皇后是否安全 --- 其他皇后已经保证相安无事了）。

```scheme
#lang sicp

(define (reverse sequence)
  (if (null? sequence)
      nil
      (append (reverse (cdr sequence))
              (list (car sequence)))))

(define (filter predicate sequence)
  (cond ((null? sequence) nil)
        ((predicate (car sequence))
         (cons (car sequence)
               (filter predicate (cdr sequence))))
        (else (filter predicate (cdr sequence)))))

(define (accumulate op initial sequence)
  (if (null? sequence)
      initial
      (op (car sequence)
          (accumulate op initial (cdr sequence)))))

(define (flatmap proc seq)
  (accumulate append nil (map proc seq)))

(define (enumerate-interval m n)
  (if (> m n)
      nil
      (cons m (enumerate-interval (+ 1 m) n))))

(define empty-board nil)

(define (adjoin-position new-row k rest-of-queens)
  (cons new-row rest-of-queens))

(define (safe? k positions)
  (let ((row (car positions))
        (sum-row-col (+ (car positions) k))
        (diff-row-col (- (car positions) k)))
    (accumulate
     (lambda (a b) (and a b))
     #t
     (map (lambda (pos col)
            (and (not (= row pos))
                 (not (= sum-row-col (+ pos col)))
                 (not (= diff-row-col (- pos col)))))
          (cdr positions) (reverse (enumerate-interval 1 (- k 1)))))))
  
(define (queens board-size)
  (define (queen-cols k)
    (if (= k 0)
        (list empty-board)
        (filter
         (lambda (positions) (safe? k positions))
         (flatmap
          (lambda (rest-of-queens)
            (map (lambda (new-row)
                   (adjoin-position new-row k rest-of-queens))
                 (enumerate-interval 1 board-size)))
          (queen-cols (- k 1))))))
  (queen-cols board-size))

;>>> (queens 8)
;: ((4 2 7 3 6 8 5 1)
;:  (5 2 4 7 3 8 6 1)
;:  (3 5 2 8 6 4 7 1)
;:  (3 6 4 2 8 5 7 1)
;:  (5 7 1 3 8 6 4 2)
;:  (4 6 8 3 1 7 5 2)
;:  (3 6 8 1 4 7 5 2)
;:  (5 3 8 4 7 1 6 2)
;:  (5 7 4 1 3 8 6 2)
;:  (4 1 5 8 6 3 7 2)
;:  (3 6 4 1 8 5 7 2)
;:  (4 7 5 3 1 6 8 2)
;:  (6 4 2 8 5 7 1 3)
;:  (6 4 7 1 8 2 5 3)
;:  (1 7 4 6 8 2 5 3)
;:  (6 8 2 4 1 7 5 3)
;:  (6 2 7 1 4 8 5 3)
;:  (4 7 1 8 5 2 6 3)
;:  (5 8 4 1 7 2 6 3)
;:  (4 8 1 5 7 2 6 3)
;:  (2 7 5 8 1 4 6 3)
;:  (1 7 5 8 2 4 6 3)
;:  (2 5 7 4 1 8 6 3)
;:  (4 2 7 5 1 8 6 3)
;:  (5 7 1 4 2 8 6 3)
;:  (6 4 1 5 8 2 7 3)
;:  (5 1 4 6 8 2 7 3)
;:  (5 2 6 1 7 4 8 3)
;:  (6 3 7 2 8 5 1 4)
;:  (2 7 3 6 8 5 1 4)
;:  (7 3 1 6 8 5 2 4)
;:  (5 1 8 6 3 7 2 4)
;:  (1 5 8 6 3 7 2 4)
;:  (3 6 8 1 5 7 2 4)
;:  (6 3 1 7 5 8 2 4)
;:  (7 5 3 1 6 8 2 4)
;:  (7 3 8 2 5 1 6 4)
;:  (5 3 1 7 2 8 6 4)
;:  (2 5 7 1 3 8 6 4)
;:  (3 6 2 5 8 1 7 4)
;:  (6 1 5 2 8 3 7 4)
;:  (8 3 1 6 2 5 7 4)
;:  (2 8 6 1 3 5 7 4)
;:  (5 7 2 6 3 1 8 4)
;:  (3 6 2 7 5 1 8 4)
;:  (6 2 7 1 3 5 8 4)
;:  (3 7 2 8 6 4 1 5)
;:  (6 3 7 2 4 8 1 5)
;:  (4 2 7 3 6 8 1 5)
;:  (7 1 3 8 6 4 2 5)
;:  (1 6 8 3 7 4 2 5)
;:  (3 8 4 7 1 6 2 5)
;:  (6 3 7 4 1 8 2 5)
;:  (7 4 2 8 6 1 3 5)
;:  (4 6 8 2 7 1 3 5)
;:  (2 6 1 7 4 8 3 5)
;:  (2 4 6 8 3 1 7 5)
;:  (3 6 8 2 4 1 7 5)
;:  (6 3 1 8 4 2 7 5)
;:  (8 4 1 3 6 2 7 5)
;:  (4 8 1 3 6 2 7 5)
;:  (2 6 8 3 1 4 7 5)
;:  (7 2 6 3 1 4 8 5)
;:  (3 6 2 7 1 4 8 5)
;:  (4 7 3 8 2 5 1 6)
;:  (4 8 5 3 1 7 2 6)
;:  (3 5 8 4 1 7 2 6)
;:  (4 2 8 5 7 1 3 6)
;:  (5 7 2 4 8 1 3 6)
;:  (7 4 2 5 8 1 3 6)
;:  (8 2 4 1 7 5 3 6)
;:  (7 2 4 1 8 5 3 6)
;:  (5 1 8 4 2 7 3 6)
;:  (4 1 5 8 2 7 3 6)
;:  (5 2 8 1 4 7 3 6)
;:  (3 7 2 8 5 1 4 6)
;:  (3 1 7 5 8 2 4 6)
;:  (8 2 5 3 1 7 4 6)
;:  (3 5 2 8 1 7 4 6)
;:  (3 5 7 1 4 2 8 6)
;:  (5 2 4 6 8 3 1 7)
;:  (6 3 5 8 1 4 2 7)
;:  (5 8 4 1 3 6 2 7)
;:  (4 2 5 8 6 1 3 7)
;:  (4 6 1 5 2 8 3 7)
;:  (6 3 1 8 5 2 4 7)
;:  (5 3 1 6 8 2 4 7)
;:  (4 2 8 6 1 3 5 7)
;:  (6 3 5 7 1 4 2 8)
;:  (6 4 7 1 3 5 2 8)
;:  (4 7 5 2 6 1 3 8)
;:  (5 7 2 6 3 1 4 8))
```

***

**练习 2.43** Louis Reasoner 在做 **练习 2.42** 时遇到了麻烦，他的 `queens` 过程看起来能行，但却运行得极慢（Louis 居然无法忍耐到它解 $6\times 6$ 棋盘的问题）。当 Louis 请 Eva Lu Ator 帮忙时，她指出他在 `flatmap` 里交换了嵌套映射的顺序，将它写成了：

```
(flatmap
 (lambda (new-row)
   (map (lambda (rest-of-queens)
          (adjoin-position new-row k rest-of-queens))
        (queen-cols (- k 1))))
 (enumerate-interval 1 board-size))
```

请解释一下，为什么这样交换顺序会使程序运行得非常慢。估计一下，用 Louis 的程序去解决八皇后问题大约需要多少时间，假定 **练习 2.42** 中的程序需要时间 $T$ 求解这一难题。

嵌套顺序调换后，`flatmap` 在映射 `(enumerate-interval 1 board-size)` 的每一个元素时，都要重复计算 `(queen-cols (- k 1))`，由于 `board-size` 为 8，所需时间大约为 $8T$。

***

**练习 2.44** 请定义出 `corner-split` 里使用的过程 `up-split`，它与 `right-split` 类似，除在其中交换了 `below` 和 `beside` 的角色之外。

```scheme
#lang sicp

(define (up-split painter n)
  (if (= n 0)
      painter
      (let ((smaller (up-split painter (- n 1))))
        (below painter (beside smaller smaller)))))
```

***

**练习 2.45** 可以将 `right-split` 和 `up-split` 表述为某种广义划分操作的实例。请定义一个过程 `split`，使它具有如下性质，求值：

```
(define right-split (split beside below))

(define up-split (split below beside))
```

产生过程 `right-split` 和 `up-split`，其行为与前面定义的过程一样。

```scheme
#lang sicp

(define (split orient1 orient2)
  (define (iter painter n)
    (if (= n 0)
        painter
        (let ((smaller (iter painter (- n 1))))
          (orient1 painter (orient2 smaller smaller)))))
  iter)
```

***

**练习 2.46** 从原点出发的一个两维向量 $\bm{v}$ 可以用一个由 $x$ 坐标和 $y$ 坐标构成的序列表示。请为这样的向量实现一个数据抽象：给出一个构造函数 `make-vect`，以及对应的选择函数 `xcor-vect` 和 `ycor-vect`。借助于你给出的构造函数和选择函数，实现过程 `add-vect`、`sub-vect` 和 `scale-vect`，它们能完成向量加法、向量减法和向量的伸缩。

$$
(x_1, y_1) + (x_2, y_2) = (x_1 + x_2, y_1 + y_2)
$$

$$
(x_1, y_1) - (x_2, y_2) = (x_1 - x_2, y_1 - y_2)
$$

$$
s \cdot (x, y) = (sx, sy)
$$

```scheme
#lang sicp

(define (make-vect x y)
  (cons x y))

(define (xcor-vect v)
  (car v))

(define (ycor-vect v)
  (cdr v))

(define (add-vect v1 v2)
  (make-vect (+ (xcor-vect v1) (xcor-vect v2))
             (+ (ycor-vect v1) (ycor-vect v2))))

(define (sub-vect v1 v2)
  (make-vect (- (xcor-vect v1) (xcor-vect v2))
             (- (ycor-vect v1) (ycor-vect v2))))

(define (scale-vect s v)
  (make-vect (* s (xcor-vect v))
             (* s (ycor-vect v))))
```

***

**练习 2.47** 下面是实现框架的两个可能的过程函数：

```
(define (make-frame origin edge1 edge2)
  (list origin edge1 edge2))

(define (make-frame origin edge1 edge2)
  (cons (origin) (cons edge1 edge2)))
```

请为每个构造函数提供适当的选择函数，为框架做出相应的实现。

```scheme
#lang sicp

(define (make-frame origin edge1 edge2)
  (list origin edge1 edge2))

(define (origin-frame frame)
  (car frame))

(define (edge1-frame frame)
  (cadr frame))

(define (edge2-frame frame)
  (caddr frame))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;
; (define (make-frame origin edge1 edge2)
;   (cons origin (cons edge1 edge2)))
;
; (define (origin-frame frame)
;   (car frame))
;
; (define (edge1-frame frame)
;   (cadr frame))
;
; (define (edge2-frame frame)
;   (cddr frame))
;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
```

***

**练习 2.48** 平面上的一条直线可以用一对向量表示 --- 从原点到线段起点的向量，以及从原点到线段终点的向量。请用你在 **练习 2.46** 做出的向量表示定义一种线段表示，其中用构造函数 `make-segment` 以及选择函数 `start-segment` 和 `end-segment`。

```scheme
#lang sicp

(define (make-vect x y)
  (cons x y))

(define (xcor-vect v)
  (car v))

(define (ycor-vect v)
  (cdr v))

(define (make-segment v1 v2)
  (cons v1 v2))

(define (start-segment s)
  (car s))

(define (end-segment s)
  (cdr s))
```

***

**练习 2.49** 利用 `segments->painter` 定义下面的基本画家：

a) 画出给定框架边界的画家。

b) 通过连接框架两对角画出一个大叉子的画家。

c) 通过连接框架各边的中点画出一个菱形的画家。

d) 画家 `wave`。

```scheme
#lang sicp
(#%require sicp-pict)

(define (edges->painter frame)
  ((segments->painter
    (list
     (make-segment (make-vect 0 0) (make-vect 1 0))
     (make-segment (make-vect 1 0) (make-vect 1 1))
     (make-segment (make-vect 1 1) (make-vect 0 1))
     (make-segment (make-vect 0 1) (make-vect 0 0))))
   frame))

(define (diags->painter frame)
  ((segments->painter
    (list
     (make-segment (make-vect 0 0) (make-vect 1 1))
     (make-segment (make-vect 1 0) (make-vect 0 1))))
   frame))

(define (midpoints->painter frame)
  ((segments->painter
    (list
     (make-segment (make-vect 0.5 0) (make-vect 1 0.5))
     (make-segment (make-vect 1 0.5) (make-vect 0.5 1))
     (make-segment (make-vect 0.5 1) (make-vect 0 0.5))
     (make-segment (make-vect 0 0.5) (make-vect 0.5 0))))
   frame))

(define (wave->painter frame)
  ((segments->painter
    (list
     (make-segment (make-vect 0.20 0.00) (make-vect 0.35 0.50))
     (make-segment (make-vect 0.35 0.50) (make-vect 0.30 0.60))
     (make-segment (make-vect 0.30 0.60) (make-vect 0.15 0.45))
     (make-segment (make-vect 0.15 0.45) (make-vect 0.00 0.60))
     (make-segment (make-vect 0.00 0.80) (make-vect 0.15 0.65))
     (make-segment (make-vect 0.15 0.65) (make-vect 0.30 0.70))
     (make-segment (make-vect 0.30 0.70) (make-vect 0.40 0.70))
     (make-segment (make-vect 0.40 0.70) (make-vect 0.35 0.85))
     (make-segment (make-vect 0.35 0.85) (make-vect 0.40 1.00))
     (make-segment (make-vect 0.60 1.00) (make-vect 0.65 0.85))
     (make-segment (make-vect 0.65 0.85) (make-vect 0.60 0.70))
     (make-segment (make-vect 0.60 0.70) (make-vect 0.75 0.70))
     (make-segment (make-vect 0.75 0.70) (make-vect 1.00 0.40))
     (make-segment (make-vect 1.00 0.20) (make-vect 0.60 0.48))
     (make-segment (make-vect 0.60 0.48) (make-vect 0.80 0.00))
     (make-segment (make-vect 0.40 0.00) (make-vect 0.50 0.30))
     (make-segment (make-vect 0.50 0.30) (make-vect 0.60 0.00))))
   frame))
```

```scheme
(paint edges->painter #:height 512 #:width 512)
```

![image]({{ image_path('2.49-1.png') }})
{: style="margin: 0 auto; width: 30%; text-align: center;"}

```scheme
(paint diags->painter #:height 512 #:width 512)
```

![image]({{ image_path('2.49-2.png') }})
{: style="margin: 0 auto; width: 30%; text-align: center;"}

```scheme
(paint midpoints->painter #:height 512 #:width 512)
```

![image]({{ image_path('2.49-3.png') }})
{: style="margin: 0 auto; width: 30%; text-align: center;"}

```scheme
(paint wave->painter #:height 512 #:width 512)
```

![image]({{ image_path('2.49-4.png') }})
{: style="margin: 0 auto; width: 30%; text-align: center;"}

***

**练习 2.50** 请定义变换 `flip-horiz`，它能在水平方向上反转画家。再定义出对画家做反时针方向 180 度和 270 度旋转的变换。

```scheme
#lang sicp
(#%require sicp-pict)

(define (flip-horiz painter)
  (transform-painter painter
                     (make-vect 1.0 0.0)
                     (make-vect 0.0 0.0)
                     (make-vect 1.0 1.0)))
```

***

**练习 2.51** 定义对画家的 `below` 操作，它以两个画家为参数。在给定了一个框架后，由 `below` 得到的画家将要求第一个画家在框架的下部画图，要求第二个画家在框架的上部画图。请按两种方式定义 `below`：首先写出一个类似于上面 `beside` 的过程：另一个则直接通过 `beside` 和适当的旋转操作（来自 **练习 2.50**）完成有关工作。

```scheme
#lang sicp
(#%require sicp-pict)

(define (below painter1 painter2)
  (let ((split-point (make-vect 0.0 0.5)))
    (let ((paint-below
           (transform-painter painter1
                              (make-vect 0.0 0.0)
                              (make-vect 1.0 0.0)
                              split-point))
          (paint-up
           (transform-painter painter2
                              split-point
                              (make-vect 1.0 0.5)
                              (make-vect 0.0 1.0))))
      (lambda (frame)
        (paint-below frame)
        (paint-up frame)))))

#;(define (below painter1 painter2)
  (rotate270 (beside (rotate90 painter2)
                     (rotate90 painter1))))
```

***

**练习 2.52** 在上面描述的各个层次上工作，修改图 2-9 中所示的方块的限制。特别是：

a) 给 **练习 2.49** 的基本 wave 画家加入某些线段（例如，加上一个笑脸）。

b) 修改 `corner-split` 的构造模式（例如，只用 `up-split` 和 `right-split` 的图像的各一个副本，而不是两个）。

c) 修改 `square-limit`，换一种使用 `square-of-four` 的方式，以另一种不同模式组合起各个角区（例如，你可以让大的 Rogers 先生从正方形的每个角向外看）。

```scheme
#lang sicp
(#%require sicp-pict)

(define (wave-smile->painter frame)
  ((segments->painter
    (list
     (make-segment (make-vect 0.20 0.00) (make-vect 0.35 0.50))
     (make-segment (make-vect 0.35 0.50) (make-vect 0.30 0.60))
     (make-segment (make-vect 0.30 0.60) (make-vect 0.15 0.45))
     (make-segment (make-vect 0.15 0.45) (make-vect 0.00 0.60))
     (make-segment (make-vect 0.00 0.80) (make-vect 0.15 0.65))
     (make-segment (make-vect 0.15 0.65) (make-vect 0.30 0.70))
     (make-segment (make-vect 0.30 0.70) (make-vect 0.40 0.70))
     (make-segment (make-vect 0.40 0.70) (make-vect 0.35 0.85))
     (make-segment (make-vect 0.35 0.85) (make-vect 0.40 1.00))
     (make-segment (make-vect 0.60 1.00) (make-vect 0.65 0.85))
     (make-segment (make-vect 0.65 0.85) (make-vect 0.60 0.70))
     (make-segment (make-vect 0.60 0.70) (make-vect 0.75 0.70))
     (make-segment (make-vect 0.75 0.70) (make-vect 1.00 0.40))
     (make-segment (make-vect 1.00 0.20) (make-vect 0.60 0.48))
     (make-segment (make-vect 0.60 0.48) (make-vect 0.80 0.00))
     (make-segment (make-vect 0.40 0.00) (make-vect 0.50 0.30))
     (make-segment (make-vect 0.50 0.30) (make-vect 0.60 0.00))
     (make-segment (make-vect 0.40 0.90) (make-vect 0.425 0.95))
     (make-segment (make-vect 0.425 0.95) (make-vect 0.45 0.90))
     (make-segment (make-vect 0.55 0.90) (make-vect 0.575 0.95))
     (make-segment (make-vect 0.575 0.95) (make-vect 0.60 0.90))
     (make-segment (make-vect 0.47 0.80) (make-vect 0.53 0.80))))
   frame))

(define (split orient1 orient2)
  (define (iter painter n)
    (if (= n 0)
        painter
        (let ((smaller (iter painter (- n 1))))
          (orient1 painter (orient2 smaller smaller)))))
  iter)

(define right-split (split beside below))

(define up-split (split below beside))

(define (corner-split painter n)
  (if (= n 0)
      painter
      (let ((up (up-split painter (- n 1)))
            (right (right-split painter (- n 1))))
        (let ((top-left up)
              (bottom-right right)
              (corner (corner-split painter (- n 1))))
          (beside (below painter top-left)
                  (below bottom-right corner))))))

(define (square-of-four tl tr bl br)
  (lambda (painter)
    (let ((top (beside (tl painter) (tr painter)))
          (bottom (beside (bl painter) (br painter))))
      (below bottom top))))

(define (square-limit painter n)
  (let ((combine4 (square-of-four identity flip-horiz
                                  flip-vert rotate180)))
    (combine4 (corner-split painter n))))
```

```scheme
(paint wave-smile->painter #:height 512 #:width 512)
```

![image]({{ image_path('2.52-1.png') }})
{: style="margin: 0 auto; width: 30%; text-align: center;"}

```scheme
(paint (corner-split wave-smile->painter 3) #:height 512 #:width 512)
```

![image]({{ image_path('2.52-2.png') }})
{: style="margin: 0 auto; width: 30%; text-align: center;"}

```scheme
(paint (square-limit einstein 3) #:height 512 #:width 512)
```

![image]({{ image_path('2.52-3.jpg') }})
{: style="margin: 0 auto; width: 30%; text-align: center;"}

***

**练习 2.53** 解释器在求值下面的各个表达式时将打印出什么？

```
(list 'a 'b 'c)

(list (list 'george))

(cdr '((x1 x2) (y1 y2)))

(cadr '((x1 x2) (y1 y2)))

(pair? (car '(a short list)))

(memq 'red '((red shoes) (blue socks)))

(memq 'red '(red shoes blue socks))
```

```scheme
#lang sicp

(list 'a 'b 'c)
;: (a b c)

(list (list 'george))
;: ((george))

(cdr '((x1 x2) (y1 y2)))
;: ((y1 y2))

(cadr '((x1 x2) (y1 y2)))
;: (y1 y2)

(pair? (car '(a short list)))
;: #f

(memq 'red '((red shoes) (blue socks)))
;: #f

(memq 'red '(red shoes blue socks))
;: (red shoes blue socks)
```

***

**练习 2.54** 如果两个表包含着同样元素，这些元素也按同样顺序排列，那么就称这两个表 `equal?`。例如：

```
(equal? '(this is a list) '(this is a list))
```

是真；而

```
(equal? '(this is a list) '(this (is a) list))
```

是假。说得更准确些，我们可以从符号相等的基本 `eq?` 出发，以递归方式定义出 `equal?`。`a` 和 `b` 是 `equal?` 的，如果它们都是符号，而且这两个符号满足 `eq?`；或者它们都是表，而且 `(car a)` 和 `(car b)` 相互 `equal?`，它们的 `(cdr a)` 和 `(cdr b)` 也是 `equal?`。请利用这一思路定义出 `equal?` 过程。

```scheme
#lang sicp

(define (equal? a b)
  (if (null? a)
      (if (null? b)
          #t
          #f)
      (if (null? b)
          #f
          (if (not (pair? (car a)))
              (if (not (pair? (car b)))
                  (and (eq? (car a) (car b))
                       (equal? (cdr a) (cdr b)))
                  #f)
              (if (not (pair? (car b)))
                  #f
                  (and (equal? (car a) (car b))
                       (equal? (cdr a) (cdr b))))))))
```

***

**练习 2.55** Eva Lu Ator 输入了表达式：

```
(car ''abracadabra)
```

令她吃惊的是解释器打印出的是 `quote`。请解释这一情况。

由于 `'` 实际是 `quote` 过程，即 `'abracadabra` 为 `(quote abracadabra)`，因此 `(car ''abracadabra)` 为 `(car '(quote abracadabra))`，会输出 `quote`。

***

**练习 2.56** 请说明如何扩充基本求导规则，以便能够处理更多种类的表达式。例如，通过给程序 `deriv` 增加一个新子句，并以适当方式定义过程 `exponentiation?`、`base`、`exponent` 和 `make-exponentiation` 的方式，实现下述求导规则（你可以考虑用符号 `**` 表示乘幂）：

$$
\frac{\mathrm{d}(u^n)}{\mathrm{d}x} = nu^{n-1}\left(\frac{\mathrm{d}u}{\mathrm{d}x}\right)
$$

请将如下规则也构造到程序里：任何东西的 $0$ 次幂都是 $1$，而它们的 $1$ 次幂都是其自身。

```scheme
#lang sicp

(define (=number? exp num)
  (and (number? exp) (= exp num)))

(define (** base exponent)
  (define (iter exponent r)
    (if (= exponent 0)
        r
        (iter (- exponent 1) (* r base))))
  (iter exponent 1))

(define (deriv exp var)
  (cond ((number? exp) 0)
        ((variable? exp)
         (if (same-variable? exp var) 1 0))
        ((sum? exp)
         (make-sum (deriv (addend exp) var)
                   (deriv (augend exp) var)))
        ((product? exp)
         (make-sum
          (make-product (multiplier exp)
                        (deriv (multiplicand exp) var))
          (make-product (deriv (multiplier exp) var)
                        (multiplicand exp))))
        ((exponentiation? exp)
         (make-product
          (make-product
           (exponent exp)
           (make-exponentiation (base exp) (- (exponent exp) 1)))
          (deriv (base exp) var)))
        (else
         (error "unknow expression type --- DERIV" exp))))

(define (variable? x) (symbol? x))

(define (same-variable? v1 v2)
  (and (variable? v1) (variable? v2) (eq? v1 v2)))

(define (make-sum a1 a2)
  (cond ((=number? a1 0) a2)
        ((=number? a2 0) a1)
        ((and (number? a1) (number? a2)) (+ a1 a2))
        (else (list '+ a1 a2))))

(define (make-product m1 m2)
  (cond ((or (=number? m1 0) (=number? m2 0)) 0)
        ((=number? m1 1) m2)
        ((=number? m2 1) m1)
        ((and (number? m1) (number? m2)) (* m1 m2))
        (else (list '* m1 m2))))

(define (sum? x)
  (and (pair? x) (eq? (car x) '+)))

(define (addend s) (cadr s))

(define (augend s) (caddr s))

(define (product? x)
  (and (pair? x) (eq? (car x) '*)))

(define (multiplier p) (cadr p))

(define (multiplicand p) (caddr p))

(define (make-exponentiation b e)
  (cond ((=number? e 0) 1)
        ((=number? e 1) b)
        ((and (number? b) (number? e)) (** b e))
        (else (list '** b e))))

(define (exponentiation? x)
  (and (pair? x) (eq? (car x) '**)))

(define (base e) (cadr e))

(define (exponent e) (caddr e))

;>>> (deriv '(* (** x 3) y) 'x)
;: (* (* 3 (** x 2)) y)
```

***

**练习 2.57** 请扩充求导程序，使之能处理任意项（两项或者更多项）的和与乘积。这样，上面的最后一个例子就可以表示为：

```
(deriv '(* x y (+ x 3)) 'x)
```

设法通过只修改和与乘积的表示，而完全不修改过程 `deriv` 的方式完成这一扩充。例如，让一个和式的 `addend` 是它的第一项，而其 `augend` 是和式中的其余项。

```scheme
#lang sicp

(define (length l)
  (define (iter l r)
    (if (null? l)
        r
        (iter (cdr l) (+ r 1))))
  (iter l 0))

(define (filter predicate sequence)
  (cond ((null? sequence) nil)
        ((predicate (car sequence))
         (cons (car sequence)
               (filter predicate (cdr sequence))))
        (else (filter predicate (cdr sequence)))))

(define (=number? exp num)
  (and (number? exp) (= exp num)))

(define (** base exponent)
  (define (iter exponent r)
    (if (= exponent 0)
        r
        (iter (- exponent 1) (* r base))))
  (iter exponent 1))

(define (deriv exp var)
  (cond ((number? exp) 0)
        ((variable? exp)
         (if (same-variable? exp var) 1 0))
        ((sum? exp)
         (make-sum (deriv (addend exp) var)
                   (deriv (augend exp) var)))
        ((product? exp)
         (make-sum
          (make-product (multiplier exp)
                        (deriv (multiplicand exp) var))
          (make-product (deriv (multiplier exp) var)
                        (multiplicand exp))))
        ((exponentiation? exp)
         (make-product
          (make-product
           (exponent exp)
           (make-exponentiation (base exp) (- (exponent exp) 1)))
          (deriv (base exp) var)))
        (else
         (error "unknow expression type --- DERIV" exp))))

(define (variable? x) (symbol? x))

(define (same-variable? v1 v2)
  (and (variable? v1) (variable? v2) (eq? v1 v2)))

(define (make-sum a1 . a2)
  (let ((a3 (filter
             (lambda (x) (or (pair? x) (not (=number? x 0))))
             a2)))
    (cond ((= (length a3) 0) a1)
          ((= (length a3) 1)
           (let ((a (car a3)))
             (cond ((=number? a1 0) a)
                   ((=number? a 0) a1)
                   ((and (number? a1) (number? a)) (+ a1 a))
                   (else (list '+ a1 a)))))
          (else
           (if (=number? a1 0)
               (cons '+ a3)
               (cons '+ (cons a1 a3)))))))
        
(define (make-product m1 . m2)
  (let ((m3 (filter
             (lambda (x) (or (pair? x) (not (=number? x 1))))
             m2)))
    (cond ((> (length (filter
                      (lambda (x) (and (not (pair? x)) (=number? x 0)))
                      m3)) 0) 0)
          ((= (length m3) 0) m1)
          ((= (length m3) 1)
           (let ((m (car m3)))
             (cond ((or (=number? m1 0) (=number? m 0)) 0)
                   ((=number? m1 1) m)
                   ((=number? m 1) m1)
                   ((and (number? m1) (number? m)) (* m1 m))
                   (else (list '* m1 m)))))
          (else
           (cond ((=number? m1 0) 0)
                 ((=number? m1 1) (cons '* m3))
                 (else (cons '* (cons m1 m3))))))))
               
(define (sum? x)
  (and (pair? x) (eq? (car x) '+)))

(define (addend s) (cadr s))

(define (augend s)
  (if (= (length s) 3)
      (caddr s)
      (cons '+ (cddr s))))

(define (product? x)
  (and (pair? x) (eq? (car x) '*)))

(define (multiplier p) (cadr p))

(define (multiplicand p)
  (if (= (length p) 3)
      (caddr p)
      (cons '* (cddr p))))

(define (make-exponentiation b e)
  (cond ((=number? e 0) 1)
        ((=number? e 1) b)
        ((and (number? b) (number? e)) (** b e))
        (else (list '** b e))))

(define (exponentiation? x)
  (and (pair? x) (eq? (car x) '**)))

(define (base e) (cadr e))

(define (exponent e) (caddr e))

;>>> (deriv '(* x y (+ x 3)) 'x)
;: (+ (* x y) (* y (+ x 3)))
```

***

**练习 2.58** 假定我们希望修改求导程序，使它能用于常规数学公式，其中 `+` 和 `*` 采用的是中缀运算符而不是前缀。由于求导程序使基于抽象数据定义的，要修改它，使之能用于另一种不同的表达式表示，我们只需要换一套工作在新的、求导程序需要使用的代数表达式的表示形式上的谓词、选择函数和构造函数。

a) 请说明怎样做出这些过程，以便完成在中缀表示形式（例如 `(x + (3 * (x + (y + 2))))` 上的代数表达式求导。为了简化有关的工作，现在可以假定 `+` 和 `*` 总是取两个参数，而且表达式中已经加上了所有的括号。

b) 如果允许标准的代数写法，例如 `(x + 3 * (x + y + 2))`，问题就会变得更困难许多。在这种表达式里可能不写不必要的括号。并要假定乘法应该在加法之前完成。你还能为这种表示方式设计好适当的谓词、选择函数和构造函数，使我们的求导程序仍然能工作吗？

```scheme
#lang sicp

(define (deriv exp var)
  (cond ((number? exp) 0)
        ((variable? exp)
         (if (same-variable? exp var) 1 0))
        ((sum? exp)
         (make-sum (deriv (addend exp) var)
                   (deriv (augend exp) var)))
        ((product? exp)
         (make-sum
          (make-product (multiplier exp)
                        (deriv (multiplicand exp) var))
          (make-product (deriv (multiplier exp) var)
                        (multiplicand exp))))
        ((exponentiation? exp)
         (make-product
          (make-product
           (exponent exp)
           (make-exponentiation (base exp) (- (exponent exp) 1)))
          (deriv (base exp) var)))
        (else
         (error "unknow expression type --- DERIV" exp))))

(define (** base exponent)
  (define (iter exponent r)
    (if (= exponent 0)
        r
        (iter (- exponent 1) (* r base))))
  (iter exponent 1))

(define (=number? exp num)
  (and (number? exp) (= exp num)))

(define (variable? v) (symbol? v))

(define (same-variable? v1 v2)
  (and (variable? v1) (variable? v2) (eq? v1 v2)))

(define (make-sum a1 a2)
  (cond ((=number? a1 0) a2)
        ((=number? a2 0) a1)
        ((and (number? a1) (number? a2)) (+ a1 a2))
        (else (list a1 '+ a2))))

(define (sum? x) (eq? (cadr x) '+))

(define (addend s) (car s))

(define (augend s) (caddr s))

(define (make-product m1 m2)
  (cond ((or (=number? m1 0) (=number? m2 0)) 0)
        ((=number? m1 1) m2)
        ((=number? m2 1) m1)
        ((and (number? m1) (number? m2)) (* m1 m2))
        (else (list m1 '* m2))))

(define (product? x) (eq? (cadr x) '*))

(define (multiplier p) (car p))

(define (multiplicand p) (caddr p))

(define (make-exponentiation b e)
  (cond ((=number? e 0) 1)
        ((=number? e 1) b)
        ((and (number? b) (number? e)) (** b e))
        (else (list b '** e))))

(define (exponentiation? x) (eq? (cadr x) '**))

(define (base e) (car e))

(define (exponent e) (caddr e))

;>>> (deriv '(x + (3 * (x + (y + 2)))) 'x)
;: 4
```

```scheme
#lang sicp

(define (deriv exp var)
  (cond ((number? exp) 0)
        ((variable? exp)
         (if (same-variable? exp var) 1 0))
        ((sum? exp)
         (make-sum (deriv (addend exp) var)
                   (deriv (augend exp) var)))
        ((product? exp)
         (make-sum
          (make-product (multiplier exp)
                        (deriv (multiplicand exp) var))
          (make-product (deriv (multiplier exp) var)
                        (multiplicand exp))))
        ((exponentiation? exp)
         (make-product
          (make-product
           (exponent exp)
           (make-exponentiation (base exp) (- (exponent exp) 1)))
          (deriv (base exp) var)))
        (else
         (error "unknow expression type --- DERIV" exp))))

(define (** base exponent)
  (define (iter exponent r)
    (if (= exponent 0)
        r
        (iter (- exponent 1) (* r base))))
  (iter exponent 1))

(define (=number? exp num)
  (and (number? exp) (= exp num)))

(define (variable? v) (symbol? v))

(define (same-variable? v1 v2)
  (and (variable? v1) (variable? v2) (eq? v1 v2)))

(define (make-sum a1 a2)
  (cond ((=number? a1 0) a2)
        ((=number? a2 0) a1)
        ((and (number? a1) (number? a2)) (+ a1 a2))
        (else (list a1 '+ a2))))

(define (sum? x)
  (pair? (memq '+ x)))

(define (addend s)
  (let ((x (reverse (cdr (memq '+ (reverse s))))))
    (if (null? (cdr x))
        (car x)
        x)))

(define (augend s)
  (define (iter rs r)
    (if (eq? (car rs) '+)
        r
        (iter (cdr rs) (cons (car rs) r))))
  (let ((x (iter (reverse s) nil)))
    (if (null? (cdr x))
        (car x)
        x)))

(define (make-product m1 m2)
  (cond ((or (=number? m1 0) (=number? m2 0)) 0)
        ((=number? m1 1) m2)
        ((=number? m2 1) m1)
        ((and (number? m1) (number? m2)) (* m1 m2))
        (else (list m1 '* m2))))

(define (product? x)
  (pair? (memq '* x)))

(define (multiplier p)
  (let ((x (reverse (cdr (memq '* (reverse p))))))
    (if (null? (cdr x))
        (car x)
        x)))

(define (multiplicand p)
  (define (iter rp r)
    (if (eq? (car rp) '*)
        r
        (iter (cdr rp) (cons (car rp) r))))
  (let ((x (iter (reverse p) nil)))
    (if (null? (cdr x))
        (car x)
        x)))

(define (make-exponentiation b e)
  (cond ((=number? e 0) 1)
        ((=number? e 1) b)
        ((and (number? b) (number? e)) (** b e))
        (else (list b '** e))))

(define (exponentiation? x)
  (pair? (memq '** x)))

(define (base e)
  (let ((x (reverse (cdr (memq '** (reverse e))))))
    (if (null? (cdr x))
        (car x)
        x)))

(define (exponent e)
  (define (iter re r)
    (if (eq? (car re) '**)
        r
        (iter (cdr re) (cons (car re) r))))
  (let ((x (iter (reverse e) nil)))
    (if (null? (cdr x))
        (car x)
        x)))

;>>> (deriv '(x + 3 * (x + y + 2)) 'x)
;: 4
```

***

**练习 2.59** 请为采用未排序表的集合实现定义 `union-set` 操作。

```scheme
#lang sicp

(define (element-of-set? x set)
  (cond ((null? set) #f)
        ((equal? x (car set)) #t)
        (else (element-of-set? x (cdr set)))))

(define (union-set set1 set2)
  (cond ((null? set1) set2)
        ((null? set2) set1)
        ((element-of-set? (car set1) set2)
         (union-set (cdr set1) set2))
        (else (cons (car set1)
                    (union-set (cdr set1) set2)))))
```

***

**练习 2.60** 我们前面说明了如何将集合表示为没有重复元素的表。现在假定允许重复，例如，集合 $\{1, 2, 3\}$ 可能被表示为表 `(2 3 2 1 3 2 2)`。请为在这种表示上的操作设计过程 `element-of-set?`、`adjoin-set`、`union-set`、和 `intersection-set`。与前面不重复表示里的相应操作相比，现在各个操作的效率怎么样？在什么样的应用中你更倾向于使用这种表示，而不是前面那种无重复的表示？

```scheme
#lang sicp

(define (element-of-set? x set)
  (cond ((null? set) #f)
        ((equal? x (car set)) #t)
        (else (element-of-set? x (cdr set)))))

(define (adjoin-set x set)
  (cons x set))

(define (intersection-set set1 set2)
  (cond ((or (null? set1) (null? set2)) '())
        ((element-of-set? (car set1) set2)
         (cons (car set1)
               (intersection-set (cdr set1) set2)))
        (else (intersection-set (cdr set1) set2))))

(define (union-set set1 set2)
  (cond ((null? set1) set2)
        ((null? set2) set1)
        (else (cons (car set1)
                    (union-set (cdr set1) set2)))))
```

允许重复的情况下，过程 `element-of-set?` 的效率变化无法确定；由于过程 `adjoin-set` 和 `union-set` 不再需要使用 `element-of-set?`，因此效率会提高；而 `intersection-set` 由于需要处理更长的表，效率会下降。在需要添加元素或是取并频繁的应用中使用这种表示效率更高。

***

**练习 2.61** 请给出采用排序表示时 `adjoin-set` 的实现。通过类似 `element-of-set?` 的方式说明，可以如何利用排序的优势得到一个过程，其平均所需的步数是采用未排序表示时的一半。

将待插入元素依次与集合中元素比较，如果待插入元素大于当前元素，继续比较下一个；如果等于当前元素，不必插入；如果小于当前元素，插入到该位置。该表示下平均所需的步数是采用未排序表示时的一半。

```scheme
#lang sicp

(define (adjoin-set x set)
  (cond ((null? set) (list x))
        ((< (car set) x)
         (cons (car set) (adjoin-set x (cdr set))))
        ((= (car set) x)
         set)
        (else (cons x set))))

;>>> (adjoin-set -10 (list 1 5 7 13))
;: (-10 1 5 7 13)

;>>> (adjoin-set 5 (list 1 5 7 13))
;: (1 5 7 13)

;>>> (adjoin-set 8 (list 1 5 7 13))
;: (1 5 7 8 13)

;>>> (adjoin-set 991 (list 1 5 7 13))
;: (1 5 7 13 991)
```

***

**练习 2.62** 请给出在集合的排序表示上 `union-set` 的一个 $\Theta(n)$ 实现。

```scheme
#lang sicp

(define (union-set set1 set2)
  (cond ((null? set1) set2)
        ((null? set2) set1)
        (else
         (let ((x1 (car set1)) (x2 (car set2)))
          (cond ((= x1 x2)
                 (cons x1 (union-set (cdr set1) (cdr set2))))
                ((< x1 x2)
                 (cons x1 (union-set (cdr set1) set2)))
                (else
                 (cons x2 (union-set set1 (cdr set2)))))))))
```

***

**练习 2.63** 下面两个过程都能将树变换为表：

```
#lang sicp

(define (tree->list-1 tree)
  (if (null? tree)
      '()
      (append (tree->list-1 (left-branch tree))
              (cons (entry tree)
                    (tree->list-1 (right-branch tree))))))

(define (tree->list-2 tree)
  (define (copy-to-list tree result-list)
    (if (null? tree)
        result-list
        (copy-to-list (left-branch tree)
                      (cons (entry tree)
                            (copy-to-list (right-branch tree)
                                          result-list)))))
  (copy-to-list tree '()))
```

a) 这两个过程对所有的树都产生同样结果吗？如果不是，它们产生出的结果有什么不同？它们对图 2-16 中的那些树产生什么样的表？

b) 将 $n$ 个结点的平衡树变换为表时，这两个过程所需的步数具有同样量级的增长速度吗？如果不一样，哪个过程增长得慢一些？

结果相同，对图 2-16 中的树产生的表均为 `(1 3 5 7 9 11)`。

不同，`tree->list-1` 慢一些。因为 `tree->list-1` 中的 `append` 会将复杂度提升 $n$ 倍。

***

**练习 2.64** 下面过程 `list->tree` 将一个有序表变换为一棵平衡二叉树。其中的辅助函数 `partial-tree` 以整数 $n$ 和一个至少包含 $n$ 个元素的表为参数，构造出一棵包含这个表的前 $n$ 个元素的平衡树。由 `partial-tree` 返回的结果是一个序对（用 `cons` 构造），其 `car` 是构造出的树，其 `cdr` 是没有包含在树种那些元素的表。

```
(define (list->tree elements)
  (car (partial-tree elements (length elements))))

(define (partial-tree elts n)
  (if (= n 0)
      (cons '() elts)
      (let ((left-size (quotient (- n 1) 2)))
        (let ((left-result (partial-tree elts left-size)))
          (let ((left-tree (car left-result))
                (non-left-elts (cdr left-result))
                (right-size (- n (+ left-size 1))))
            (let ((this-entry (car non-left-elts))
                  (right-result (partial-tree (cdr non-left-elts)
                                              right-size)))
              (let ((right-tree (car right-result))
                    (remaining-elts (cdr right-result)))
                (cons (make-tree this-entry left-tree right-tree)
                      remaining-elts))))))))
```

a) 请简要地并尽可能清楚地解释为什么 `partial-tree` 能完成工作。请画出将 `list->tree` 用于表 `(1 3 5 7 9 11)` 产生出的树。

b) 过程 `list->tree` 转换 $n$ 个元素的表所需的步数以什么量级增长？

对于一个 `list`，首先计算出构造左子树和右子树需要的结点数，然后用所需结点递归地调用 `partial-tree` 构造子树，最后用生成的子树和根结点构造树。`list->tree` 用于表 `(1 3 5 7 9 11)` 产生出的树为：

![image]({{ image_path('2.64.svg') }})
{: style="margin: 0 auto; width: 20%; text-align: center;"}

`partial-tree` 访问每个结点恰好一次，将其设置为跟结点，其余操作均为常数级复杂度，因此步数为 $\Theta(n)$。

***

**练习 2.65** 利用 **练习 2.63** 和 **练习 2.64** 的结果，给出对采用（平衡）二叉树方式实现的集合的 `union-set` 和 `intersection-set` 操作的 $\Theta(n)$ 实现。

```scheme
#lang sicp

(define (make-tree entry left right)
  (list entry left right))

(define (entry tree) (car tree))

(define (left-branch tree) (cadr tree))

(define (right-branch tree) (caddr tree))

(define (tree->list tree)
  (define (copy-to-list tree result-list)
    (if (null? tree)
        result-list
        (copy-to-list (left-branch tree)
                      (cons (entry tree)
                            (copy-to-list (right-branch tree)
                                          result-list)))))
  (copy-to-list tree '()))

(define (list->tree elements)
  (car (partial-tree elements (length elements))))

(define (partial-tree elts n)
  (if (= n 0)
      (cons '() elts)
      (let ((left-size (quotient (- n 1) 2)))
        (let ((left-result (partial-tree elts left-size)))
          (let ((left-tree (car left-result))
                (non-left-elts (cdr left-result))
                (right-size (- n (+ left-size 1))))
            (let ((this-entry (car non-left-elts))
                  (right-result (partial-tree (cdr non-left-elts)
                                              right-size)))
              (let ((right-tree (car right-result))
                    (remaining-elts (cdr right-result)))
                (cons (make-tree this-entry left-tree right-tree)
                      remaining-elts))))))))

(define (union-set set1 set2)
  (define (union-set-list set1 set2)
    (cond ((null? set1) set2)
          ((null? set2) set1)
          (else
           (let ((x1 (car set1)) (x2 (car set2)))
             (cond ((= x1 x2)
                    (cons x1 (union-set-list (cdr set1) (cdr set2))))
                   ((< x1 x2)
                    (cons x1 (union-set-list (cdr set1) set2)))
                   (else
                    (cons x2 (union-set-list set1 (cdr set2)))))))))
  (list->tree (union-set-list (tree->list set1) (tree->list set2))))

(define (intersection-set set1 set2)
  (define (intersection-set-list set1 set2)
    (if (or (null? set1) (null? set2))
        '()
        (let ((x1 (car set1)) (x2 (car set2)))
          (cond ((= x1 x2)
                 (cons
                  x1
                  (intersection-set-list (cdr set1) (cdr set2))))
                ((< x1 x2)
                 (intersection-set-list (cdr set1) set2))
                (else
                 (intersection-set-list set1 (cdr set2)))))))
  (list->tree (intersection-set-list
               (tree->list set1)
               (tree->list set2))))

;>>> (define s1 (list->tree '(1 2 3 5 6 8 10 11)))
;>>> (define s2 (list->tree '(2 4 6 8 11 13)))

;>>> (tree->list (union-set s1 s2))
;: (1 2 3 4 5 6 8 10 11 13)

;>>> (tree->list (intersection-set s1 s2))
;: (2 6 8 11)
```

***

**练习 2.66** 假设记录的集合采用二叉树实现，按照其中作为键值的数值排序。请实现相应的 `lookup` 过程。

```scheme
#lang sicp

(define (key record) (car record))

(define (left-branch tree) (cadr tree))

(define (right-branch tree) (caddr tree))

(define (lookup given-key set-of-records)
  (cond ((null? set-of-records) false)
        ((< given-key (key (car set-of-records)))
         (lookup given-key (left-branch set-of-records)))
        ((= given-key (key (car set-of-records)))
         (car set-of-records))
        (else
         (lookup given-key (right-branch set-of-records)))))
```

***

**练习 2.67** 请定义一棵编码树和一个样例消息：

```
(define sample-tree
  (make-code-tree (make-leaf 'A 4)
                  (make-code-tree
                   (make-leaf 'B 2)
                   (make-code-tree (make-leaf 'D 1)
                                   (make-leaf 'C 1)))))

(define sample-message '(0 1 1 0 0 1 0 1 0 1 1 1 0))
```

然后用过程 `decode` 完成该消息的编码，给出编码的结果。

```scheme
#lang sicp

(define (make-leaf symbol weight)
  (list 'leaf symbol weight))

(define (leaf? object)
  (eq? (car object) 'leaf))

(define (symbol-leaf x) (cadr x))

(define (weight-leaf x) (caddr x))

(define (make-code-tree left right)
  (list left
        right
        (append (symbols left) (symbols right))
        (+ (weight left) (weight right))))

(define (left-branch tree) (car tree))

(define (right-branch tree) (cadr tree))

(define (symbols tree)
  (if (leaf? tree)
      (list (symbol-leaf tree))
      (caddr tree)))

(define (weight tree)
  (if (leaf? tree)
      (weight-leaf tree)
      (cadddr tree)))

(define (decode bits tree)
  (define (decode-1 bits current-branch)
    (if (null? bits)
        '()
        (let ((next-branch
               (choose-branch (car bits) current-branch)))
          (if (leaf? next-branch)
              (cons (symbol-leaf next-branch)
                    (decode-1 (cdr bits) tree))
              (decode-1 (cdr bits) next-branch)))))
  (decode-1 bits tree))

(define (choose-branch bit branch)
  (cond ((= bit 0) (left-branch branch))
        ((= bit 1) (right-branch branch))
        (else (error "bad bit -- CHOOSE-BRANCH" bit))))

#;(define sample-tree
  (make-code-tree (make-leaf 'A 4)
                  (make-code-tree
                   (make-leaf 'B 2)
                   (make-code-tree (make-leaf 'D 1)
                                   (make-leaf 'C 1)))))

;>>> (define sample-message '(0 1 1 0 0 1 0 1 0 1 1 1 0))

;>>> (decode sample-message sample-tree)
;: (A D A B B C A)
```

***

**练习 2.68** 过程 `encode` 以一个消息和一棵树为参数，产生出被编码消息所对应的二进制位的表：

```
(define (encode message tree)
  (if (null? message)
      '()
      (append (encode-symbol (car message) tree)
              (encode (cdr message) tree))))
```

其中的 `encode-symbol` 是需要你写出的过程，它能根据给定的树产生出给定符号的二进制位表。你所设计的 `encode-symbol` 在遇到未出现在树中的符号时应报告错误。请用在 **练习 2.67** 中得到的结果检查所实现的过程，工作中用同样一棵树，看看得到的结果是不是原来那个消息。

```scheme
#lang sicp

(define (make-leaf symbol weight)
  (list 'leaf symbol weight))

(define (leaf? object)
  (eq? (car object) 'leaf))

(define (symbol-leaf x) (cadr x))

(define (weight-leaf x) (caddr x))

(define (make-code-tree left right)
  (list left
        right
        (append (symbols left) (symbols right))
        (+ (weight left) (weight right))))

(define (left-branch tree) (car tree))

(define (right-branch tree) (cadr tree))

(define (symbols tree)
  (if (leaf? tree)
      (list (symbol-leaf tree))
      (caddr tree)))

(define (weight tree)
  (if (leaf? tree)
      (weight-leaf tree)
      (cadddr tree)))

(define (encode message tree)
  (if (null? message)
      '()
      (append (encode-symbol (car message) tree)
              (encode (cdr message) tree))))

(define (encode-symbol symbol tree)
  (cond ((not (memq symbol (symbols tree)))
         (error "bad symbol -- ENCODE-SYMBOL" symbol))
        ((leaf? tree) '())
        (else
         (if (memq symbol (symbols (left-branch tree)))
             (cons '0 (encode-symbol symbol (left-branch tree)))
             (cons '1 (encode-symbol symbol (right-branch tree)))))))

#;(define sample-tree
  (make-code-tree (make-leaf 'A 4)
                  (make-code-tree
                   (make-leaf 'B 2)
                   (make-code-tree (make-leaf 'D 1)
                                   (make-leaf 'C 1)))))

;>>> (define sample-message '(A D A B B C A))

;>>> (encode sample-message sample-tree)
;: (0 1 1 0 0 1 0 1 0 1 1 1 0)
```

***

**练习 2.69** 下面过程以一个符号 --- 频度对偶表为参数（其中没有任何符号出现在多于一个对偶中），并根据 Huffman 算法生成出 Huffman 编码树。

```
(define (generate-huffman-tree pairs)
  (successive-merge (make-leaf-set pairs)))
```

其中的 `make-leaf-set` 是前面给出的过程，它将对偶表转换为叶的有序集，`successive-merge` 是需要你写的过程，它使用 `make-code-tree` 反复归并集合中具有最小权重的元素，直至集合里只剩下一个元素为止。这个元素就是我们所需要的 Huffman 树。（这一过程稍微有点技巧性，但并不很复杂。如果你正在设计的过程变得复杂，那么几乎可以肯定是在什么地方搞错了。你应该尽可能地利用有序集合表示这一事实。）

```scheme
#lang sicp

(define (make-leaf symbol weight)
  (list 'leaf symbol weight))

(define (leaf? object)
  (eq? (car object) 'leaf))

(define (symbol-leaf x) (cadr x))

(define (weight-leaf x) (caddr x))

(define (make-code-tree left right)
  (list left
        right
        (append (symbols left) (symbols right))
        (+ (weight left) (weight right))))

(define (left-branch tree) (car tree))

(define (right-branch tree) (cadr tree))

(define (symbols tree)
  (if (leaf? tree)
      (list (symbol-leaf tree))
      (caddr tree)))

(define (weight tree)
  (if (leaf? tree)
      (weight-leaf tree)
      (cadddr tree)))

(define (adjoin-set x set)
  (cond ((null? set) (list x))
        ((< (weight x) (weight (car set))) (cons x set))
        (else (cons (car set)
                    (adjoin-set x (cdr set))))))

(define (make-leaf-set pairs)
  (if (null? pairs)
      '()
      (let ((pair (car pairs)))
        (adjoin-set (make-leaf (car pair)
                               (cadr pair))
                    (make-leaf-set (cdr pairs))))))

(define (generate-huffman-tree pairs)
  (successive-merge (make-leaf-set pairs)))

(define (successive-merge tree-set)
  (if (= (length tree-set) 1)
      (car tree-set)
      (successive-merge (adjoin-set
                         (make-code-tree
                          (car tree-set) (cadr tree-set))
                         (cddr tree-set)))))

;>>> (generate-huffman-tree '((A 4) (B 2) (C 1) (D 1)))
#;
((leaf A 4)
 ((leaf B 2) ((leaf D 1) (leaf C 1) (D C) 2) (B D C) 4)
 (A B D C)
 8)
```

***

**练习 2.70** 下面带有相对频度的 8 个符号的字母表，是为了有效编码 20 世纪 50 年代的摇滚歌曲中的词语而设计的。（请注意，“字母表”中的“符号”不必是单个字母。）

A | 2 | NA | 16  
BOOM | 1 | SHA | 3  
GET | 2 | YIP | 9  
JOB | 2 | WAH | 1  

请用（**练习 2.69** 的）`generate-huffman-tree` 过程生成对应的 Huffman 树，用（**练习 2.68** 的）`encode` 过程编码下面的消息：

Get a job  
Sha na na na na na na na na  
Get a job  
Sha na na na na na na na na  
Wah yip yip yip yip yip yip yip yip yip  
Sha boom

这一编码需要多少个二进制位？如果对这 8 个符号的字母表采用定长编码，完成这个歌曲的编码最少需要多少个二进制位？

```scheme
#lang sicp

(define (make-leaf symbol weight)
  (list 'leaf symbol weight))

(define (leaf? object)
  (eq? (car object) 'leaf))

(define (symbol-leaf x) (cadr x))

(define (weight-leaf x) (caddr x))

(define (make-code-tree left right)
  (list left
        right
        (append (symbols left) (symbols right))
        (+ (weight left) (weight right))))

(define (left-branch tree) (car tree))

(define (right-branch tree) (cadr tree))

(define (symbols tree)
  (if (leaf? tree)
      (list (symbol-leaf tree))
      (caddr tree)))

(define (weight tree)
  (if (leaf? tree)
      (weight-leaf tree)
      (cadddr tree)))

(define (encode message tree)
  (if (null? message)
      '()
      (append (encode-symbol (car message) tree)
              (encode (cdr message) tree))))

(define (encode-symbol symbol tree)
  (cond ((not (memq symbol (symbols tree)))
         (error "bad symbol -- ENCODE-SYMBOL" symbol))
        ((leaf? tree) '())
        (else
         (if (memq symbol (symbols (left-branch tree)))
             (cons '0 (encode-symbol symbol (left-branch tree)))
             (cons '1 (encode-symbol symbol (right-branch tree)))))))

(define (adjoin-set x set)
  (cond ((null? set) (list x))
        ((< (weight x) (weight (car set))) (cons x set))
        (else (cons (car set)
                    (adjoin-set x (cdr set))))))

(define (make-leaf-set pairs)
  (if (null? pairs)
      '()
      (let ((pair (car pairs)))
        (adjoin-set (make-leaf (car pair)
                               (cadr pair))
                    (make-leaf-set (cdr pairs))))))

(define (generate-huffman-tree pairs)
  (successive-merge (make-leaf-set pairs)))

(define (successive-merge tree-set)
  (if (= (length tree-set) 1)
      (car tree-set)
      (successive-merge (adjoin-set
                         (make-code-tree
                          (car tree-set) (cadr tree-set))
                         (cddr tree-set)))))

#;
(define sample-pairs '((A 2) (NA 16) (BOOM 1) (SHA 3)
                       (GET 2) (YIP 9) (JOB 2) (WAH 1)))

#;
(define sample-message '(GET A JOB SHA NA NA NA NA NA NA NA NA
                         GET A JOB SHA NA NA NA NA NA NA NA NA
                         WAH YIP YIP YIP YIP YIP YIP YIP YIP YIP
                         SHA BOOM))

;>>> (generate-huffman-tree sample-pairs)
#;
((leaf NA 16)
 ((leaf YIP 9)
  (((leaf A 2) ((leaf WAH 1) (leaf BOOM 1) (WAH BOOM) 2) (A WAH BOOM) 4)
   ((leaf SHA 3) ((leaf JOB 2) (leaf GET 2) (JOB GET) 4) (SHA JOB GET) 7)
   (A WAH BOOM SHA JOB GET)
   11)
  (YIP A WAH BOOM SHA JOB GET)
  20)
 (NA YIP A WAH BOOM SHA JOB GET)
 36)

;>>> (encode sample-message (generate-huffman-tree sample-pairs))
;: (1 1 1 1 1 1 1 0 0 1 1 1 1 0 1 1 1 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 0 0 1 1 1 1 0 1 1 1 0 0 0 0 0 0 0 0 0 1 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 1 1 0 1 1 0 1 1)
```

Huffman 编码需要 84 个二进制位，采用定长编码，每个单词至少需要 3 个二进制位，总共 36 个单词，供 108 位。

***

**练习 2.71** 假定我们有一棵 $n$ 个符号的字母表的 Huffman 树，其中各符号的相对频度分别是 $1, 2, 4, \cdots, 2^{n-1}$。请对 $n=5$ 和 $n=10$ 勾勒出有关的树的样子。对于这样的树（对于一般的 $n$），编码出现最频繁的符号用多少个二进制位？最不频繁的符号呢？

树的每个非叶结点至少有一棵子树为叶结点，最频繁的符号用 $1$ 个二进制位，最不频繁的符号用 $n-1$ 个二进制位。

***

**练习 2.72** 考虑你在 **练习 2.68** 中设计的编码过程。对于一个符号的编码，计算步数的增长速率是什么？请注意，这时需要把在每个结点中检查符号表所需的步数包括在内。一般性地回答这一问题是非常困难的。现在考虑一类特殊情况，其中的 $n$ 个符号的相对频度如 **练习 2.71** 所描述的。请给出编码最频繁的符号所需的步数和最不频繁的符号所需的步数的增长速度（作为 $n$ 的函数）。

判断符号在编码树中 $\Theta(n)$，树的平均深度 $\log(n)$，增长速率 $\Theta(n\log(n))$。

在 **练习 2.71** 中，最好的情况下，搜索深度为 $1$，最坏的情况为 $n-1$，因此所需的步数分别为 $\Theta(n)$、$\Theta(n^2)$。

***

**练习 2.73** 2.3.2 节描述了一个执行符号求导的程序：

```
(define (deriv exp var)
  (cond ((number? exp) 0)
        ((variable? exp)
         (if (same-variable? exp var) 1 0))
        ((sum? exp)
         (make-sum (deriv (addend exp) var)
                   (deriv (augend exp) var)))
        ((product? exp)
         (make-sum
          (make-product (multiplier exp)
                        (deriv (multiplicand exp) var))
          (make-product (deriv (multiplier exp) var)
                        (multiplicand exp))))
        (else
         (error "unknown exporession type -- DERIV" exp))))
```

可以认为，这个程序是在执行一种基于被求导表达式类型的分派工作。在这里，数据的“类型标志”就是代数运算符（例如 `+`），需要执行的操作是 `deriv`。我们也可以将这一程序变换到数据导向的风格，将基本求导过程重新写成：

```
(define (deriv exp var)
  (cond ((number? exp) 0)
        ((variable? exp) (if (same-variable? exp var) 1 0))
        (else ((get 'deriv (operator exp)) (operands exp)
                                           var))))

(define (operator exp) (car exp))

(define (operands exp) (cdr exp))
```

a) 请解释上面究竟做了些什么。为什么我们无法将相近的谓词 `number?` 和 `same-variable?` 也加入数据导向分派中？

b) 请写出针对和式与积式的求导过程，并把它们安装到表格里，以便上面程序使用所需要的辅助性代码。

c) 请选择一些你希望包括的求导规则，例如对乘幂（**练习 2.56**）求导等等，并将它们安装到这一数据导向的系统里。

d) 在这一简单的代数运算器中，表达式的类型就是构造起它们来的代数运算符。假定我们想以另一种相反的方式做索引，使得 `deriv` 里完成分派的代码行像下面这样：

```
((get (operator exp) 'deriv) (operands exp) var)
```

求导系统里还需要做哪些相应的改动？

上面的代码根据表达式的类型选择相应的求导过程处理表达式。`number?` 和 `same-variable?` 由于没有运算符，无法判断表达式类型，即无法调用 `operator` 过程，需要单独处理。

```scheme
#lang sicp

(define (make-table)
  (let ((local-table (list '*table*)))
    (define (lookup key-1 key-2)
      (let ((subtable (assoc key-1 (cdr local-table))))
        (if subtable
            (let ((record (assoc key-2 (cdr subtable))))
              (if record
                  (cdr record)
                  false))
            false)))
    (define (insert! key-1 key-2 value)
      (let ((subtable (assoc key-1 (cdr local-table))))
        (if subtable
            (let ((record (assoc key-2 (cdr subtable))))
              (if record
                  (set-cdr! record value)
                  (set-cdr! subtable
                            (cons (cons key-2 value)
                                  (cdr subtable)))))
            (set-cdr! local-table
                      (cons (list key-1
                                  (cons key-2 value))
                            (cdr local-table)))))
      'ok)
    (define (dispatch m)
      (cond ((eq? m 'lookup-proc) lookup)
            ((eq? m 'insert-proc!) insert!)
            (else (error "Unknown operation -- TABLE" m))))
    dispatch))

(define operation-table (make-table))

(define get (operation-table 'lookup-proc))

(define put (operation-table 'insert-proc!))

(define (variable? x) (symbol? x))

(define (same-variable? x v) (eq? x v))

(define (=number? x num)
  (and (number? x) (= x num)))

(define (deriv exp var)
  (cond ((number? exp) 0)
        ((variable? exp) (if (same-variable? exp var) 1 0))
        (else ((get 'deriv (operator exp)) (operands exp)
                                           var))))

(define (operator exp) (car exp))

(define (operands exp) (cdr exp))

(define (install-sum-package)
  (define (make-sum a1 a2)
    (cond ((=number? a1 0) a2)
          ((=number? a2 0) a1)
          ((and (number? a1) (number? a2)) (+ a1 a2))
          (else (list '+ a1 a2))))
  (define (addend operands) (car operands))
  (define (augend operands) (cadr operands))
  (define (deriv-sum operands var)
    (make-sum (deriv (addend operands) var)
              (deriv (augend operands) var)))
    
  
  (put 'make '+ make-sum)
  (put 'deriv '+ deriv-sum)
  (display "Install sum package done\n"))

(define (make-sum a1 a2)
  ((get 'make '+) a1 a2))

(define (install-product-package)
  (define (make-product m1 m2)
    (cond ((or (=number? m1 0) (=number? m2 0)) 0)
          ((=number? m1 1) m2)
          ((=number? m2 1) m1)
          (else (list '* m1 m2))))
  (define (multiplier operands) (car operands))
  (define (multiplicand operands) (cadr operands))
  (define (deriv-product operands var)
    (make-sum
     (make-product (multiplier operands)
                   (deriv (multiplicand operands) var))
     (make-product (deriv (multiplier operands) var)
                   (multiplicand operands))))

  (put 'make '* make-product)
  (put 'deriv '* deriv-product)
  (display "Install product package done\n"))

(define (make-product m1 m2)
  ((get 'make '*) m1 m2))

(define (** base exponent)
  (if (= exponent 0)
      1
      (* base (** base (- exponent 1)))))

(define (install-exponentiation-package)
  (define (make-exponentiation b e)
    (cond ((=number? e 0) 1)
          ((=number? e 1) b)
          ((and (number? b) (number? e)) (** b e))
          (else (list '** b e))))
  (define (base operands) (car operands))
  (define (exponent operands) (cadr operands))
  (define (deriv-exponentiation operands var)
    (make-product
     (make-product
      (exponent operands)
      (make-exponentiation (base operands) (- (exponent operands) 1)))
     (deriv (base operands) var)))

  (put 'make '** make-exponentiation)
  (put 'deriv '** deriv-exponentiation)
  (display "Install exponentiation package done\n"))

(define (make-exponentiation b e)
  ((get 'make '**) b e))

(install-sum-package)
(install-product-package)
(install-exponentiation-package)

;>>> (deriv '(+ (* x x) (* 2 (** x 3))) 'x)
;: (+ (+ x x) (* 2 (* 3 (** x 2))))
```

`put` 过程调用时前两个参数调换一下即可。

***

**练习 2.74** Insatiable Enterprise 公司是一个高度分散经营的联合公司，由大量分布在世界各地的分支机构组成。公司的计算机设施已经通过一种非常巧妙的网络连接模式联为一体，它使得从任何一个用户的角度看，整个网络就像是一台计算机。在第一次试图利用网络能力从各分支机构的文件中提取管理信息时，Insatiable 的总经理非常沮丧地发现，虽然所有分支机构的文件都被实现为 Scheme 的数据结构，但是各分支机构所用的数据结构却各不相同。她马上招集了各分支机构的经理会议，希望寻找一种策略集成起这些文件，以便在维持各个分支机构中现存独立工作方式的同时，又能满足公司总部管理的需要。

请说明这种策略可以如何通过数据导向的程序设计技术实现。作为例子，假定每个分支机构的人事记录都存放在一个独立文件里，其中包含了一集以雇员名字作为键值的记录。而有关集合的结构却由于分支机构的不同而不同。进一步说，某个雇员的记录本身又是一个集合（各分支机构所用的结构也不同），其中所包含的信息也在一些作为键值的标识符之下，例如 address 和 salary。特别是考虑如下问题：

a) 请为公司总部实现一个 `get-record` 过程，使它能从一个特定的人事文件里提取出一个特定的雇员记录。这一过程应该能应用于任何分支机构的文件。请说明各个独立分支机构的文件应具有怎样的结构。特别是考虑，它们必须提供哪些类型信息。

b) 请为公司总部实现一个 `get-salary` 过程，它能从任何分支机构的人事文件中取得某个给定雇员的薪金信息。为了使这个操作能够工作，这些记录应具有怎样的结构？

c) 请为公司总部实现一个过程 `find-employee-record`，该过程需要针对一个特定雇员名，在所有分支机构的文件查找对应的记录，并返回找到的记录。假定这一过程的参数是一个雇员名和所有分支文件的表。

d) 当 Insatiable 购并新公司后，要将新的人事文件结合到系统中，必须做哪些修改。

```scheme
#lang sicp

(define (get-record employee-name personnel-file)
  (let ((record ((get 'get-record (type-tag personnel-file))
                 employee-name
                 (contents personnel-file))))
    (if record
        (attach-tag (type-tag personnel-file) record)
        #f)))

(define (get-salary record)
  ((get 'get-salary (type-tag record)) (contents record)))

(define (find-employee-record employee-name personnel-files)
  (if (null? personnel-files)
      #f
      (let ((record (get-record employee-name (car personnel-files))))
        (if record
            record
            (find-employee-record employee-name (cdr personnel-files))))))
```

***

**练习 2.75** 请用消息传递的风格实现构造函数 `make-from-mag-ang`。这一过程应该与上面给出的 `make-from-real-imag` 过程类似。

```scheme
#lang sicp

(define (make-from-mag-ang magnitude angle)
  (define (dispatch op)
    (cond ((eq? op 'real-part) (* magnitude (cos angle)))
          ((eq? op 'imag-part) (* magnitude (sin angle)))
          ((eq? op 'magnitude) magnitude)
          ((eq? op 'angle) angle)
          (else
           (error "Unknown op -- MAKE-FROM-MAG-ANG" op))))
  dispatch)
```

***

**练习 2.76** 一个带有通用型操作的大型系统可能不断演化，在演化中常需要加入新的数据对象类型或者新的操作。对于上面提出的三种策略 ------ 带有显式分派的通用型操作，数据导向的风格，以及消息传递的风格 ------ 请描述在加入一个新类型或者新操作时，系统所必须做的修改。哪种组织方式最适合哪些经常需要加入新类型的系统？哪种组织方式最适合哪些经常加入新操作的系统？

策略 | 新类型 | 新操作  
- | - | -  
显式分派 | 创建新的命名不冲突的过程并修改通用型过程适配新类型 | 在每个类型中添加新操作并创建通用型操作  
数据导向 | 创建新的过程并安装到操作表中 | 在每个类型中添加新操作并安装到操作表中  
消息传递 | 创建新的过程 | 在每个类型中添加新操作  

两种情况消息传递均最为合适。

***

**练习 2.77** Louis Reasoner 试着去求值 `(magnitude z)`，其中的 `z` 就是图 2-24 里的那个对象。令他吃惊的是，从 `apply-generic` 出来的不是 `5` 而是一个错误信息，说没办法对类型 `(complex)` 做操作 `magnitude`。他将这次交互的情况给 Alyssa P. Hacker 看，Alyssa 说“问题出在没有为 `complex` 数定义复数选择函数，而只是为 `polar` 和 `rectangular` 数定义了它们。你需要做的就是在 `complex` 包里加入下面这些东西”：

```
(put 'real-part '(complex) real-part)

(put 'imag-part '(complex) imag-part)

(put 'magnitude '(complex) magnitude)

(put 'angle '(complex) angle)
```

请详细说明为什么这样做是可行的。作为一个例子，请考虑表达式 `(magnitude z)` 的求值过程，其中 `z` 就是图 2-24 里展示的那个对象，请追踪一下这一求值过程中的所有函数调用。特别是看看 `apply-generic` 被调用了几次？每次调用中分派的是哪个过程？

因为 `z` 的最外层标志位 `complex`，原有操作表中没有 `magnitude` 与 `complex` 的组合，因此查找失败；添加之后，调用 `(magnitude z)` 的话会逐层传递到 rectangular 的 `magnitude` 过程。

```scheme
(magnitude z)  ; call
(apply-generic 'magnitude z)
((get 'magnitude '(complex)) (contents z))
(magnitude (contents z))  ; complex
(apply-generic 'magnitude (contents z))
((get 'magnitude '(rectangular)) (contents (contents z)))
(magnitude (contents (contents z)))  ; rectangular
```

`apply-generic` 被调用了两次，第一次被分配给 `complex` 的 `magnitude` 过程，第二次被分配给 `rectangular` 的 `maginitude` 过程。

***

**练习 2.78** 包 `scheme-number` 里的内部过程几乎什么也没做，只不过是去调用基本过程 `+`、`-` 等等。直接使用语言的基本过程当然是不可能的，因为我们的数据类型标志系统要求每个数据对象都附加一个类型。然而，事实上所有 Lisp 实现都有自己的类型系统，使用在系统实现的内部，基本谓词 `symbol?` 和 `number?` 等用于确定每个数据对象是否具有特定的类型。请修改 2.4.2 节中 `type-tag`、`contents` 和 `attach-tag` 的定义，使我们的通用算术系统可以利用 Scheme 的内部类型系统。这也就是说，修改后的系统应该像原来一样工作，除了其中常规的数直接采用 Scheme 的数形式，而不是表示为一个 `car` 部分是符号 `scheme-number` 的序对。

见 **练习 2.80**。

***

**练习 2.79** 请定义一个通用型相等谓词 `equ?`，它能检查两个数是否相等。请将它安装到通用算术包里。这一操作应该能处理常规的数、有理数和复数。

见 **练习 2.80**。

***

**练习 2.80** 请定义一个通用谓词 `=zero?`，检查其参数是否为 `0`，并将它安装到通用算术包里。这一操作应该能处理常规的数、有理数和复数。

```scheme
#lang sicp

(define (make-table)
  (let ((local-table (list '*table*)))
    (define (lookup key-1 key-2)
      (let ((subtable (assoc key-1 (cdr local-table))))
        (if subtable
            (let ((record (assoc key-2 (cdr subtable))))
              (if record
                  (cdr record)
                  false))
            false)))
    (define (insert! key-1 key-2 value)
      (let ((subtable (assoc key-1 (cdr local-table))))
        (if subtable
            (let ((record (assoc key-2 (cdr subtable))))
              (if record
                  (set-cdr! record value)
                  (set-cdr! subtable
                            (cons (cons key-2 value)
                                  (cdr subtable)))))
            (set-cdr! local-table
                      (cons (list key-1
                                  (cons key-2 value))
                            (cdr local-table)))))
      'ok)
    (define (dispatch m)
      (cond ((eq? m 'lookup-proc) lookup)
            ((eq? m 'insert-proc!) insert!)
            (else (error "Unknown operation -- TABLE" m))))
    dispatch))

(define operation-table (make-table))

(define get (operation-table 'lookup-proc))

(define put (operation-table 'insert-proc!))

(define (attach-tag type-tag contents)
  (if (pair? contents)
      (cons type-tag contents)
      contents))

(define (type-tag datum)
  (if (pair? datum)
      (car datum)
      'scheme-number))

(define (contents datum)
  (if (pair? datum)
      (cdr datum)
      datum))

(define (apply-generic op . args)
  (let ((type-tags (map type-tag args)))
    (let ((proc (get op type-tags)))
      (if proc
          (apply proc (map contents args))
          (error
           "No method for these types -- APPLY-GENERIC"
           (list op type-tags))))))

(define (add x y) (apply-generic 'add x y))

(define (sub x y) (apply-generic 'sub x y))

(define (mul x y) (apply-generic 'mul x y))

(define (div x y) (apply-generic 'div x y))

(define (equ? x y) (apply-generic 'equ? x y))

(define (=zero? x) (apply-generic '=zero? x))

(define (install-scheme-number-package)
  (define (tag x)
    (attach-tag 'scheme-number x))
  (put 'equ? '(scheme-number scheme-number)
       (lambda (x y) (tag (= x y))))
  (put '=zero? '(scheme-number)
       (lambda (x) (tag (= x 0))))
  (put 'add '(scheme-number scheme-number)
       (lambda (x y) (tag (+ x y))))
  (put 'sub '(scheme-number scheme-number)
       (lambda (x y) (tag (- x y))))
  (put 'mul '(scheme-number scheme-number)
       (lambda (x y) (tag (* x y))))
  (put 'div '(scheme-number scheme-number)
       (lambda (x y) (tag (/ x y))))
  (put 'make 'scheme-number
       (lambda (x) (tag x)))
  'done)

(define (make-scheme-number n)
  ((get 'make 'scheme-number) n))

(define (install-rational-package)
  ;; internal procedures
  (define (numer x) (car x))
  (define (denom x) (cdr x))
  (define (make-rat n d)
    (let ((g (gcd n d)))
      (cons (/ n g) (/ d g))))
  (define (add-rat x y)
    (make-rat (+ (* (numer x) (denom y))
                 (* (numer y) (denom  x)))
              (* (denom x) (denom y))))
  (define (sub-rat x y)
    (make-rat (- (* (numer x) (denom y))
                 (* (numer y) (denom x)))
              (* (denom x) (denom y))))
  (define (mul-rat x y)
    (make-rat (* (numer x) (numer y))
              (* (denom x) (denom y))))
  (define (div-rat x y)
    (make-rat (* (numer x) (denom y))
              (* (denom x) (numer y))))
  (define (equ? x y)
    (and (= (numer x) (numer y))
         (= (denom x) (denom y))))
  (define (=zero? x)
    (= (numer x) 0))

  ;; interface to rest of the system
  (define (tag x) (attach-tag 'rational x))
  (put 'add '(rational rational)
       (lambda (x y) (tag (add-rat x y))))
  (put 'sub '(rational rational)
       (lambda (x y) (tag (sub-rat x y))))
  (put 'mul '(rational rational)
       (lambda (x y) (tag (mul-rat x y))))
  (put 'div '(rational rational)
       (lambda (x y) (tag (div-rat x y))))
  (put 'equ? '(rational rational)
       (lambda (x y) (tag (equ? x y))))
  (put '=zero? '(rational)
       (lambda (x) (tag (=zero? x))))
  (put 'make 'rational
       (lambda (n d) (tag (make-rat n d))))
  'done)

(define (make-rat n d)
  ((get 'make 'rational) n d))

(define (square x) (* x x))

(define (install-rectangular-package)
  (define (real-part z) (car z))
  (define (imag-part z) (cdr z))
  (define (make-from-real-imag x y) (cons x y))
  (define (magnitude z)
    (sqrt (+ (square (real-part z))
             (square (imag-part z)))))
  (define (angle z)
    (atan (imag-part z) (real-part z)))
  (define (make-from-mag-ang r a)
    (cons (* r (cos a)) (* (r (sin a)))))

  (define (tag x) (attach-tag 'rectangular x))
  (put 'real-part '(rectangular) real-part)
  (put 'imag-part '(rectangular) imag-part)
  (put 'magnitude '(rectangular) magnitude)
  (put 'angle '(rectangular) angle)
  (put 'make-from-real-imag 'rectangular
       (lambda (x y) (tag (make-from-real-imag x y))))
  (put 'make-from-mag-ang 'rectangular
       (lambda (r a) (tag (make-from-mag-ang r a))))
  'done)

(define (install-polar-package)
  (define (magnitude z) (car z))
  (define (angle z) (cdr z))
  (define (make-from-mag-ang r a) (cons r a))
  (define (real-part z)
    (* (magnitude z) (cos (angle z))))
  (define (imag-part z)
    (* (magnitude z) (sin (angle z))))
  (define (make-from-real-imag x y)
    (cons (sqrt (+ (square x) (square y)))
          (atan y x)))

  (define (tag x) (attach-tag 'polar x))
  (put 'real-part '(polar) real-part)
  (put 'imag-part '(polar) imag-part)
  (put 'magnitude '(polar) magnitude)
  (put 'angle '(polar) angle)
  (put 'make-from-real-imag 'polar
       (lambda (x y) (tag (make-from-real-imag x y))))
  (put 'make-from-mag-ang 'polar
       (lambda (r a) (tag (make-from-mag-ang r a))))
  'done)

(define (real-part z) (apply-generic 'real-part z))

(define (imag-part z) (apply-generic 'imag-part z))

(define (magnitude z) (apply-generic 'magnitude z))

(define (angle z) (apply-generic 'angle z))

(define (install-complex-package)
  (define (make-from-real-imag x y)
    ((get 'make-from-real-imag 'rectangular) x y))
  (define (make-from-mag-ang r a)
    ((get 'make-from-mag-ang 'polar) r a))
  (define (add-complex z1 z2)
    (make-from-real-imag (+ (real-part z1) (real-part z2))
                         (+ (imag-part z1) (imag-part z2))))
  (define (sub-complex z1 z2)
    (make-from-real-imag (- (real-part z1) (real-part z2))
                         (- (imag-part z2) (imag-part z2))))
  (define (mul-complex z1 z2)
    (make-from-mag-ang (* (magnitude z1) (magnitude z2))
                       (+ (angle z1) (angle z2))))
  (define (div-complex z1 z2)
    (make-from-mag-ang (/ (magnitude z1) (magnitude z2))
                       (- (angle z1) (angle z2))))
  (define (equ? z1 z2)
    (or (and (= (real-part z1) (real-part z2))
             (= (imag-part z1) (imag-part z2)))
        (and (= (magnitude z1) (magnitude z2))
             (= (angle z1) (angle z2)))))
  (define (=zero? z)
    (or (= (magnitude z) 0)
        (and (= (real-part z) 0) (= (imag-part z) 0))))
    
  (define (tag z) (attach-tag 'complex z))
  (put 'real-part '(complex) real-part)
  (put 'imag-part '(complex) imag-part)
  (put 'magnitude '(complex) magnitude)
  (put 'angle '(complex) angle)
  (put 'add '(complex complex)
       (lambda (z1 z2) (tag (add-complex z1 z2))))
  (put 'sub '(complex complex)
       (lambda (z1 z2) (tag (sub-complex z1 z2))))
  (put 'mul '(complex complex)
       (lambda (z1 z2) (tag (mul-complex z1 z2))))
  (put 'div '(complex complex)
       (lambda (z1 z2) (tag (div-complex z1 z2))))
  (put 'equ? '(complex complex)
       (lambda (z1 z2) (tag (equ? z1 z2))))
  (put '=zero? '(complex)
       (lambda (z) (tag (=zero? z))))
  (put 'make-from-real-imag 'complex
       (lambda (x y) (tag (make-from-real-imag x y))))
  (put 'make-from-mag-ang 'complex
       (lambda (r a) (tag (make-from-mag-ang r a))))
  'done)

(define (make-complex-from-real-imag x y)
  ((get 'make-from-real-imag 'complex) x y))

(define (make-complex-from-mag-ang r a)
  ((get 'make-from-mag-ang 'complex) r a))

(install-scheme-number-package)
(install-rational-package)
(install-rectangular-package)
(install-polar-package)
(install-complex-package)

;>>> (define r1 (make-rat 1 2))
;>>> (define r2 (make-rat 3 4))
;>>> (mul r1 r2)
;: (rational 3 . 8)

;>>> (define s1 (make-scheme-number 2))
;>>> (define s2 (make-scheme-number 3))
;>>> (div s1 s2)
;: 2/3
;>>> (add 3 4)
;: 7

;>>> (define c1 (make-complex-from-real-imag 3 4))
;>>> (define c2 (make-complex-from-mag-ang 5 (/ 3.1415926 4)))
;>>> (real-part c1)
;: 3
;>>> (imag-part c1)
;: 4
;>>> (magnitude c1)
;: 5
;>>> (cos (angle c1))
;: 0.6000000000000001
;>>> (add c1 c2)
;: (complex rectangular 6.53553395329987 . 7.535533858565605)

;>>> (define s1 (make-scheme-number 2))
;>>> (define s2 (make-scheme-number 3))
;>>> (equ? s1 s2)
;: #f
;>>> (equ? 4 4)
;: #t

;>>> (define r1 (make-rat 3 4))
;>>> (define r2 (make-rat 3 4))
;>>> (equ? r1 r2)
;: #t

;>>> (define c1 (make-complex-from-real-imag 3 4))
;>>> (define c2 (make-complex-from-mag-ang 5 (/ 3.1415926 4)))
;>>> (equ? c1 c2)
;: #f

;>>> (define s1 (make-scheme-number 2))
;>>> (define s2 (make-scheme-number 0))
;>>> (=zero? s1)
;: #f
;>>> (=zero? s2)
;: #t
;>>> (=zero? 0)
;: #t

;>>> (define r1 (make-rat 0 3))
;>>> (define r2 (make-rat 3 4))
;>>> (=zero? r1)
;: #t
;>>> (=zero? r2)
;: #f

;>>> (define c1 (make-complex-from-real-imag 0 0))
;>>> (define c2 (make-complex-from-mag-ang 5 (/ 3.1415926 4)))
;>>> (=zero? c1)
;: #t
;>>> (=zero? c2)
;: #f
```

***

**练习 2.81** Louis Reasoner 注意到，甚至在两个参数的类型实际相同的情况下，`apply-generic` 也可能试图去做参数间的类型强制。由此他推论说，需要在强制表格中加入一些过程，以将每个类型的参数“强制”到它们自己的类型。例如，除了上面给出的 `scheme-number->complex` 强制之外，他觉得应该有：

```
(define (scheme-number->scheme-number n) n)

(define (complex->complex z) z)

(put-coercion 'scheme-number 'scheme-number
              scheme-number->scheme-number)

(put-coercion 'complex 'complex complex->complex)
```

a) 如果安装了 Louis 的强制过程，如果在调用 `apply-generic` 时各参数的类型都为 `scheme-number` 或者类型都为 `complex`，而在表格中又找不到相应的操作，这时会出现什么情况？例如，假定我们定义了一个通用型的求幂运算：

```
(define (exp x y) (apply-generic 'exp x y))
```

并在 Scheme 数值包里放入了一个求幂过程，但其他程序包里都没有：

```
;;following added to Scheme-number package
(put 'exp '(scheme-number scheme-number)
     (lambda (x y) (tag (expt x y))))  ; using primitive expt
```

如果对两个复数调用 `exp` 会出现什么情况？

b) Louis 真的纠正了有关同样类型参数的强制问题吗？`apply-generic` 还能像原来那样正确工作吗？

c) 请修改 `apply-generic`，使之不会试着去强制两个同样类型的参数。

程序会一直做 `complex` 到 `complex` 的类型转换，陷入死循环。

没有解决，当遇到没有处理两个相同类型参数的过程时，就会陷入死循环，修改如下：

```scheme
(define (apply-generic op . args)
  (let ((type-tags (map type-tag args)))
    (let ((proc (get op type-tags)))
      (if proc
          (apply proc (map contents args))
          (if (= (length args) 2)
              (let ((type1 (car type-tags))
                    (type2 (cadr type-tags))
                    (a1 (car args))
                    (a2 (cadr args)))
                (if (eq? type1 type2)
                    (error "No method for these types"
                                (list op type-tags))
                    (let ((t1->t2 (get-coercion type1 type2))
                          (t2->t1 (get-coercion type2 type1)))
                      (cond (t1->t2
                             (apply-generic op (t1->t2 a1) a2))
                            (t2->t1
                             (apply-generic op a1 (t2->t1 a2)))
                            (else
                             (error "No method for these types"
                                    (list op type-tags)))))))
              (error "No method for these types"
                     (list op type-tags)))))))
```

***

**练习 2.82** 请阐述一种方法，设法推广 `apply-generic`，以便处理多个参数的一般性情况下的强制问题。一种可能策略是试着将所有参数都强制到第一个参数的类型，而后试着强制到第二个参数的类型，并如此试下去。请给出一个例子说明这种策略还不够一般（就像上面对两个参数的情况给出的例子那样）。（提示：请考虑一些情况，其中表格里某些合用的操作将不会被考虑。）

不够一般：可能存在相同类型的参数，此时没必要相互强制。一般化的 `apply-generic` 如下：

```scheme
#lang sicp

(define (same-type? type-tags)
  (let ((type (car type-tags)))
    (define (iter type-tags)
      (if (null? type-tags)
          true
          (and (eq? type (car type-tags))
               (iter (cdr type-tags)))))
    (iter (cdr type-tags))))

(define (get-types type-tags)
  (define (iter types rest-type-tags)
    (if (null? rest-type-tags)
        types
        (if (memq (car rest-type-tags) types)
            (iter types (cdr rest-type-tags))
            (iter (cons (car rest-type-tags) types)
                  (cdr rest-type-tags)))))
  (iter '() type-tags))

(define (coercion type args)
  (define (iter rest-args)
    (if (null? rest-args)
        '()
        (let ((type2 (type-tag (car rest-args))))
          (if (eq? type type2)
              (let ((proc (get-coercion type2 type)))
                (if proc
                    (cons (proc (car rest-args))
                          (iter (cdr rest-args)))
                    false))))))
  (iter args))
                     
(define (apply-generic op . args)
  (let ((type-tags (map type-tag args)))
    (let ((proc (get op type-tags)))
      (if proc
          (apply proc (map contents args))
          (if (same-type? type-tags)
              (error "No method for these types"
                     (list op type-tags))
              (let ((types (get-types type-tags)))
                (define (handle types)
                  (if (null? types)
                      (error "No method for these types"
                             (list op type-tags))
                      (let ((same-type-args (coercion (car types) args)))
                        (if same-type-args
                            (let ((proc (get op (map type-tag same-type-args))))
                              (if proc
                                  (apply proc same-type-args)
                                  (handle (cdr types) args)))
                            (handle (cdr types) args)))))
                (handle types)))))))
```

***

**练习 2.83** 假定你正在设计一个通用型的算术包，处理图 2-25 所示的类型塔，包括整数、有理数、实数和复数。请为每个类型（除复数外）设计一个过程，它能将该类型的对象提升到塔中的上面一层。请说明如何安装一个通用的 `raise` 操作，使之能对各个类型工作（除复数之外）。

```scheme
#lang sicp

(define (raise x) (apply-generic 'raise x))

;; add into scheme-number package
(put 'raise '(scheme-number)
     (lambda (x) (tag (make-rat x 1))))

;; add into rational package
(put 'raise '(rational)
     (lambda (x) (tag (make-real (/ (numer x) (denom x))))))

;; add into real package
(put 'raise '(real)
     (lambda (x) (tag (make-complex-from-real-imag x 0))))
```

***

**练习 2.84** 利用 **练习 2.83** 的 `raise` 操作修改 `apply-generic` 过程，使它能通过逐层提升的方式将参数强制到同样的类型，正如本节中讨论的。你将需要安排一种方式，去检查两个类型中哪个更高。请以一种能与系统中其他部分“相容”，而且又不会影响向塔中加入新层次的方式完成这一工作。

```scheme
#lang sicp

(define (same-type? type-tags)
  (let ((type (car type-tags)))
    (define (iter type-tags)
      (if (null? type-tags)
          true
          (and (eq? type (car type-tags))
               (iter (cdr type-tags)))))
    (iter (cdr type-tags))))

(define (get-types type-tags)
  (define (iter types rest-type-tags)
    (if (null? rest-type-tags)
        types
        (if (memq (car rest-type-tags) types)
            (iter types (cdr rest-type-tags))
            (iter (cons (car rest-type-tags) types)
                  (cdr rest-type-tags)))))
  (iter '() type-tags))

(define tower '(integer rational real complex))

(define (higher? type1 type2)
  (let ((length1 (length (memq type1 tower)))
        (length2 (length (memq type2 tower))))
    (< length1 length2)))

(define (get-top types)
  (define (iter top rest-types)
    (if (null? rest-types)
        top
        (if (higher? (car rest-types) top)
            (iter (car rest-types) (cdr rest-types))
            (iter top (cdr rest-types)))))
  (iter 'integer types))

(define (multi-raise type arg)
  (if (eq? (type-tag arg) type)
      arg
      (multi-raise type (raise arg))))
                     
(define (apply-generic op . args)
  (let ((type-tags (map type-tag args)))
    (let ((proc (get op type-tags)))
      (if proc
          (apply proc (map contents args))
          (if (same-type? type-tags)
              (error "No method for these types"
                     (list op type-tags))
              (let ((types (get-types type-tags)))
                (let ((top (get-top types)))
                  (let ((same-type-args (map
                                         (lambda (arg)
                                           (multi-raise top arg))
                                         args)))
                    (let ((proc (get op (map type-tag same-type-args))))
                      (if proc
                          (apply proc same-type-args)
                          (error "No method for these types"
                                 (list op type-tags))))))))))))
```

***

**练习 2.85** 本节中提到了“简化”数据对象表示的一种方法，就是使之在类型塔中尽可能地下降。请设计一个过程 `drop`（下落），使它能在如 **练习 2.83** 所描述的 类型塔中完成这一工作。这里的关键是以某种一般性的方式，判断一个数据对象能否下降。举例来说，复数 $1.5 + 0i$ 至多可以下降到 `real`，复数 $1 + 0i$ 至多可以下降到 `integer`，而复数 $2 + 3i$ 就根本无法下降。现在提出一种确定一个对象能否下降的计划：首先定义一个运算 `project`（投影），它将一个对象“压”到塔的下面一层。例如，投影一个复数就是丢掉其虚部。这样，一个数能够向下落，如果我们首先 `project` 它而后将得到的结果 `raise` 到开始的类型，最终得到的东西与开始的东西相等。请阐述实现这一想法的具体细节，并写出一个 `drop` 过程，使它可以将一个对象尽可能下落。你将需要设计各种各样的投影函数，并需要把 `project` 安装为系统里的一个通用型操作。你还需要使用一个通用型的相等谓词，例如 **练习 2.79** 所描述的。最后，请利用 `drop` 重写 **练习 2.84** 的 `apply-generic`，使之可以“简化”其结果。

```scheme
#lang sicp

(define (project x) (apply-generic 'project x))

(define (droppable? x)
  (equ? x (raise (project x))))

(define (drop x)
  (if (droppable? x)
      (drop (project x))
      x))

;; add into rational package
(put 'project '(rational)
     (lambda (x) (tag (make-scheme-number (round (/ (numer x) (denom x)))))))

;; add into real package
(put 'project '(real)
     (lambda (x) (tag (make-rat (* x 1e9) 1e9))))

;; add into complex package
(put 'project '(complex)
     (lambda (x) (tag (make-real (real-part x)))))

(define (apply-generic op . args)
  (let ((args2 (map drop args)))
    (let ((type-tags (map type-tag args2)))
      (let ((proc (get op type-tags)))
        (if proc
            (apply proc (map contents args2))
            (if (same-type? type-tags)
                (error "No method for these types"
                       (list op (map type-tag args)))
                (let ((types (get-types type-tags)))
                  (let ((top (get-top types)))
                    (let ((same-type-args (map
                                           (lambda (arg)
                                             (multi-raise top arg))
                                           args2)))
                      (let ((proc (get op (map type-tag same-type-args))))
                        (if proc
                            (apply proc same-type-args)
                            (error "No method for these types"
                                   (list op (map type-tag args)))))))))))))
```

***

**练习 2.86** 假定我们希望处理一些复数，它们的实部、虚部、模和幅角都可以是常规数值、有理数，或者我们希望加入系统的任何其他数值类型。请描述和实现系统需要做的各种修改，以满足这一需要。你应设法将例如 `sine` 和 `cosine` 一类的运算也定义为在常规数和有理数上的通用运算。

将复数包里面的各种基本算术操作全部替换成通用型算术操作。

```scheme
#lang sicp

(define (sine x) (apply-generic 'sine x))

(define (cosine x) (apply-generic 'cosine x))

;; add into scheme-number package
(put 'sine '(scheme-number)
     (lambda (x) (tag (sin x))))
(put 'cosine '(scheme-number)
     (lambda (x) (tag (cos x))))

;; add into rational package
(pur 'sine '(rational)
     (lambda (x) (tag (sin (/ (numer x) (denom x))))))
(pur 'cosine '(rational)
     (lambda (x) (tag (cos (/ (numer x) (denom x))))))
```

***

**练习 2.87** 请在通用算术包中为多项式安装 `=zero?`，这将使 `adjoin-term` 也能对系数本身也是多项式的多项式使用。

```scheme
#lang sicp

;; add into polynomial package
(define (=zero-poly? p)
  (define (iter terms)
    (if (empty-termlist? terms)
        true
        (and (=zero? (coeff (first-term terms)))
             (iter (rest-terms terms)))))
  (iter (term-list p)))

(put '=zero? '(polynomial)
     (lambda (p) (=zero-poly? p)))
```

***

**练习 2.88** 请扩充多项式系统，加上多项式的减法。（提示：你可能发现定义一个通用的求负操作非常有用。）

```scheme
#lang sicp

(define (inverse x) (apply-generic 'inverse x))

;; add into schme-number package
(put 'inverse '(scheme-number)
     (lambda (x) (tag (make-scheme-number (- x)))))

;; add into rational package
(put 'inverse '(rational)
     (lambda (x) (tag (make-rat (- (numer x)) (denom x)))))

;; add into real package
(put 'inverse '(real)
     (lambda (x) (tag (make-rat (- x )))))

;; add into complex package
(put 'inverse '(complex)
     (lambda (x)
       (tag (make-complex-from-real-imag (- (real-part x))
                                         (- (imag-part x))))))

;; add into polynominal package
(define (sub-poly p1 p2)
  (add-poly p2 (inverse p2)))

(put 'inverse '(polynominal)
     (lambda (p) (tag (make-poly
                       (variable p)
                       (map (lambda (term)
                              (make-term (order term)
                                         (inverse (coeff term))))
                            (term-list p))))))
(put 'sub '(polynominal polynominal)
     (lambda (p1 p2) (tag (sub-poly p1 p2))))
```

***

**练习 2.89** 请定义一些过程，实现上面讨论的适宜稠密多项式的项表表示。

```scheme
#lang sicp

(define (adjoin-term term term-list)
  (if (=zero? (coeff term))
      term-list
      (let ((order1 (order term))
            (order2 (- (length term-list) 1)))
        (cond ((< order1 order2)
               (cons (first-term term-list)
                     (adjoin-term term (rest-terms term-list))))
              ((= order1 order2)
               (cons (coeff term) (rest-terms term-list)))
              (else
               (adjoin-term term (cons 0 term-list)))))))

(define (first-term term-list)
  (list (- (length term-list) 1) (car term-list)))
```

***

**练习 2.90** 假定我们希望有一个多项式系统，它应该对稠密多项式和稀疏多项式都非常有效。一种途径就是在我们的系统里同时允许两种表示形式。这时的情况类似于 2.4 节复数的例子，那里同时允许采用直角坐标表示和极坐标表示。为了完成这一工作，我们必须区分不同的项表类型，并将针对项表的操作通用化。请重新设计这个多项式系统，实现这种推广。这将是一项需要付出很多努力的工作，而不是一个局部修改。

```scheme
#lang sicp

(define (install-sparse-term-list)
  (define (adjoin-term term term-list)
    (if (=zero? (coeff term))
        term-list
        (cons term term-list)))
  (define (first-term term-list) (car term-list))
  (define (rest-terms term-list) (cdr term-lists))

  (define (tag term-list) (attach-tag 'sparse term-list))
  (put 'adjoin-term 'sparse adjoin-term)
  (put 'first-term '(sparse) first-term)
  (put 'rest-terms '(sparse)
       (lambda (term-list) (tag (rest-terms term-list))))
  'done)

(define (install-dense-term-list)
  (define (adjoin-term term term-list)
    (if (=zero? (coeff term))
        term-list
        (let ((order1 (order term))
              (order2 (- (length term-list) 1)))
          (cond ((< order1 order2)
                 (cons (first-term term-list)
                       (adjoin-term term (rest-terms term-list))))
                ((= order1 order2)
                 (cons (coeff term) (rest-terms term-list)))
                (else
                 (adjoin-term term (cons 0 term-list)))))))
  (define (first-term term-list)
    (list (- (length term-list) 1) (car term-list)))
  (define (rest-terms term-list) (cdr term-lists))

  (define (tag term-list) (attach-tag 'dense term-list))
  (put 'adjoin-term 'dense adjoin-term)
  (put 'first-term '(dense) first-term)
  (put 'rest-terms '(dense)
       (lambda (term-list) (tag (rest-terms term-list))))
  'done)

(define (adjoin-term term term-list)
  ((get 'adjoin-term (type-tag term-list)) term term-list))

(define (first-term term-list)
  (apply-generic 'first-term term-list))

(define (rest-terms term-list)
  (apply-generic 'rest-terms term-list))
```

***

**练习 2.91** 一个单变元多项式可以除以另一个多项式，产生出一个商式和一个余式，例如

$$
\frac{x^5 - 1}{x^2 - 1} = x^3 + x\quad ,\quad\text{余式 } x - 1
$$

除法可以通过长除完成。也就是说，用被除式的最高次项除以除式的最高次项，得到商式的第一项；而后用这个结果乘以除式，并从被除式中减去这个乘积。剩下的工作就是用减后得到的差作为新的被除式，以便产生出随后的结果。当除式的次数超过被除式的次数时结束，将此时的被除式作为余式。还有，如果被除式就是 $0$，那么就返回 $0$ 作为商和余式。

我们可以基于 `add-poly` 和 `mul-poly` 的模型，设计出一个除法过程 `div-poly`。这一过程首先检查两个多项式是否具有相同的变元，如果是的话就剥去这一变元，将问题送给过程 `div-terms`，它执行项表上的除法运算。`div-poly` 最后将变元重新附加到 `div-terms` 返回的结果上。将 `div-terms` 设计为同时计算出除法的商式和余式是比较方便的。`div-terms` 可以以两个表为参数，返回一个商式的表和一个余式的表。

请完成下面 `div-termns` 的定义，填充其中空缺的表达式，并基于它实现 `div-poly`。该过程应该以两个多项式为参数，返回一个包含商和余式多项式的表。

```
(define (div-terms L1 L2)
  (if (empty-termlist? L1)
      (list (the-empty-termlist) (the-empty-termlist))
      (let ((t1 (first-term L1))
            (t2 (first-term L2)))
        (if (> (order t2) (order t1))
            (list (the-empty-termlist) L1)
            (let ((new-c (div (coeff t1) (coeff t2)))
                  (new-o (- (order t1) (order t2))))
              (let ((rest-of-result
                     <递归地计算结果的其余部分>
                     ))
                <形成完整的结果>
                ))))))
```

```scheme
#lang sicp

(define (div-terms L1 L2)
  (if (empty-termlist? L1)
      (list (the-empty-termlist) (the-empty-termlist))
      (let ((t1 (first-term L1))
            (t2 (first-term L2)))
        (if (> (order t2) (order t1))
            (list (the-empty-termlist) L1)
            (let ((new-c (div (coeff t1) (coeff t2)))
                  (new-o (- (order t1) (order t2))))
              (let ((rest-of-result
                     (div-terms (sub-terms
                                 L1
                                 (mul-terms (list (make-term
                                                   new-o
                                                   new-c))
                                            L2))
                                L2)
                     ))
                (list (adjoin-term (make-term new-o new-c)
                                   (car rest-of-result))
                      (cadr rest-of-result))
                ))))))

(define (div-poly p1 p2)
  (if (same-variable? (variable p1) (variable p2))
      (make-poly (variable p1)
                 (div-terms (term-list p1)
                            (term-list p2)))
      (error "Polys not in same var -- DIV-POLY"
             (list p1 p2))))
```

***

**练习 2.92** 通过加入强制性的变量序扩充多项式程序包，使多项式的加法和乘法能对具有不同变量的多项式进行。（这绝不简单！）

```scheme
#lang sicp

(define types '(scheme-number rational real complex))

(define (add-coercion x y)
  (let ((t1 (type-tag x)) (t2 (type-tag y)))
    (cond ((and (eq? t1 'polynomial) (memq t2 types))
           (add x (make-poly
                   (variable x)
                   (list (make-term 0 (content y))))))
          ((and (memq t1 types) (eq? t2 'polynominal))
           (add y (make-poly
                   (variable y)
                   (list (make-term 0 (content x))))))
          (else (add x y)))))

(define (mul-coercion x y)
  (let ((t1 (type-tag x)) (t2 (type-tag y)))
    (cond ((and (eq? t1 'polynomial) (memq t2 types))
           (mul x (make-poly
                   (variable x)
                   (list (make-term 0 (content y))))))
          ((and (memq t1 types) (eq? t2 'polynominal))
           (mul y (make-poly
                   (variable y)
                   (list (make-term 0 (content x))))))
          (else (mul x y)))))
```

***