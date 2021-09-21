---
date: 2020-09-29
tags:
  - Scheme
  - SICP
mathjax: true
---

# Learn SICP Chapter 3

*即使在变化中，它也丝毫未变。*

------ 赫拉克立特（Heraclitus）
{: style="text-align: right;"}

*变得越多，它就越是原来的样子。*

------ 阿尔芬斯 &#183; 卡尔（Alphonse Karr）
{: style="text-align: right;"}

***

**练习 3.1** 一个累加器是一个过程，反复用数值参数调用它，就会使它的各个参数累加到一个和数中。每次调用时累加器将返回当前的累加和。请写出一个生成累加器的过程 `make-accumulator`，它所生成的每个累加器维持维持着一个独立的和。送给 `make-accumulator` 的输入描述了有关和数的初始值，例如：

```
(define A (make-accumulator 5))

(A 10)
15

(A 10)
25
```

```scheme
#lang sicp

(define (make-accumulator init)
  (lambda (value)
    (begin (set! init (+ init value))
           init)))
```

***

**练习 3.2** 在对应用程序做软件测试时，能够统计出在计算过程中某个给定过程被调用的次数常常很有用处。请写出一个过程 `make-monitored`，它以一个过程 `f` 作为输入，该过程本身有一个输入。`make-monitored` 返回的结果是第三个过程，比如说 `mf`，它将用一个内部计数器维持着自己被调用的次数。如果 `mf` 的输入是特殊符号 `how-many-calls?`，那么 `mf` 就返回内部计数器的值；如果输入是特殊符号 `reset-count`，那么 `mf` 就将计数器重新设置为 `0`；对于任何其他输入，`mf` 将返回过程 `f` 应用于这一输入的结果，并将内部计数器加一。例如，我们可能以下面方式做出过程 `sqrt` 的一个受监视的版本：

```
(define s (make-monitored sqrt))

(s 100)
10

(s 'how-many-calls?)
1
```

```scheme
#lang sicp

(define (make-monitored f)
  (let ((_count 0))
    (lambda (arg)
      (cond ((eq? arg 'how-many-calls?)
             _count)
            ((eq? arg 'reset-count)
             (set! _count 0))
            (else
             (begin (set! _count (+ _count 1))
                    (f arg)))))))

;>>> (define s (make-monitored sqrt))

;>>> (s 100)
;: 10

;>>> (s 2)
;: 1.4142135623730951

;>>> (s 'how-many-calls?)
;: 2

;>>> (s 'reset-count)

;>>> (s 'how-many-calls?)
;: 0
```

***

**练习 3.3** 请修改 `make-account` 过程，使它能创建一种带密码保护的账户。也就是说，应该让 `make-account` 以一个符号作为附加的参数，就像：

```
(define acc (make-account 100 'secret-password))
```

这样产生的账户对象在接到一个请求时，只有同时提供了账户提供了账户创建时给定的密码，它才处理这一请求，否则就发出一个抱怨信息：

```
((acc 'secret-password 'withdraw) 40)
60

((acc 'some-other-password 'deposit) 50)
"Incorrect password"
```

```scheme
#lang sicp

(define (make-account balance password)
  (define (withdraw amount)
    (if (>= balance amount)
        (begin (set! balance (- balance amount))
               balance)
        "Insufficient funds"))
  (define (deposit amount)
    (begin (set! balance (+ balance amount))
           balance))
  (define (dispatch pass m)
    (if (eq? pass password)
        (cond ((eq? m 'withdraw) withdraw)
              ((eq? m 'deposit) deposit)
              (else (error "Unknown request -- MAKE-ACCOUNT"
                           m)))
        (lambda (arg . args)
          "Incorrect password")))
  dispatch)
```

***

**练习 3.4** 请修改 **练习 3.3** 中的 `make-account` 过程，加上另一个局部状态变量，使得如果一个账户被用不正确的密码连续访问了 7 次，它就将去调用过程 `call-the-cops`（叫警察）。

```scheme
#lang sicp

(define (call-the-cops)
  "Cops are coming")

(define (make-account balance password)
  (let ((times 7))
    (define (withdraw amount)
      (if (>= balance amount)
          (begin (set! balance (- balance amount))
                 balance)
          "Insufficient funds"))
    (define (deposit amount)
      (begin (set! balance (+ balance amount))
             balance))
    (define (dispatch pass m)
      (if (eq? pass password)
          (cond ((eq? m 'withdraw) withdraw)
                ((eq? m 'deposit) deposit)
                (else (error "Unknown request -- MAKE-ACCOUNT"
                             m)))
          (lambda (...args)
            (set! times (- times 1))
            (if (<= times 0)
                (call-the-cops)
                "Incorrect password"))))
    dispatch))


;>>> (define acc (make-account 100 '752))
;>>> ((acc '752 'withdraw) 40)
;: 60
;>>> ((acc '1 'withdraw) 30)
;: "Incorrect password"
;>>> ((acc '2 'withdraw) 30)
;: "Incorrect password"
;>>> ((acc '3 'withdraw) 30)
;: "Incorrect password"
;>>> ((acc '4 'withdraw) 30)
;: "Incorrect password"
;>>> ((acc '5 'withdraw) 30)
;: "Incorrect password"
;>>> ((acc '6 'withdraw) 30)
;: "Incorrect password"
;>>> ((acc '7 'withdraw) 30)
;: "Cops are coming"
;>>> ((acc '8 'withdraw) 30)
;: "Cops are coming"
;>>> ((acc '9 'withdraw) 30)
;: "Cops are coming"
```

***

**练习 3.5** 蒙特卡罗积分是一种通过蒙特卡罗模拟估计定积分值的方法。考虑由谓词 $P(x, y)$ 描述的一个区域的面积计算问题，该谓词对于此区域内部的点 $(x, y)$ 为真，对于不在区域内的点为假。举例来说，包含在以 $(5, 7)$ 为圆心半径为 $3$ 的圆圈所围成的区域，可以用检查公式 $(x - 5)^2 + (y - 7)^2 \le 3^2$ 是否成立的谓词描述。要估计这样一个谓词所描述的区域的面积，我们应首先选取一个包含该区域的矩形。例如，以 $(2, 4)$ 和 $(8, 10)$ 作为对角点的矩形包含着上面的圆。需要确定的积分也就是这一矩形中位于所关注区域内的那个部分。我们可以这样估计积分值：随机选取位于矩形中的点 $(x, y)$，对每个点检查 $P(x, y)$，确定该点是否位于所考虑的区域内。如果试了足够多的点 $(x, y)$，那么落在区域内的点的比率将能给出矩形中有关区域的比率。这样，用这一比率去乘整个矩形的面积，就能得到相应积分的一个估计值。

将蒙特卡罗积分实现为一个过程 `estimate-integral`，它以一个谓词 `P`，矩形的上下边界 `x1`、`x2`、`y1` 和 `y2`，以及为产生估计值而要求试验的次数作为参数。你的过程应该使用上面用于估计 $\pi$ 值的同一个 `monte-carlo` 过程。请用你的 `estimate-integral`，通过对单位圆面积的度量产生出 $\pi$ 的一个估计值。

你可能发现，有一个从给定区域中选取随机数的过程非常有用。下面的 `random-in-range` 过程利用 **1.2.6 节** 里使用的 `random` 实现这一工作，它返回一个小于其输入的非负数。

```
(define (random-in-range low high)
  (let ((range (- high low)))
    (+ low (random range))))
```

```scheme
#lang sicp

(define (random-in-range low high)
  (let ((range (- high low)))
    (+ low (random range))))

(define (unit-circle-test)
  (let ((x (random-in-range -1.0 1.0))
        (y (random-in-range -1.0 1.0)))
    (< (+ (* x x) (* y y)) 1)))

(define (monte-carlo trials experiment)
  (define (iter trials-remaining trials-passed)
    (cond ((= trials-remaining 0)
           (/ trials-passed trials))
          ((experiment)
           (iter (- trials-remaining 1) (+ trials-passed 1)))
          (else
           (iter (- trials-remaining 1) trials-passed))))
  (iter trials 0))


;>>> (* 4.0 (monte-carlo 100 unit-circle-test))
;: 3.28
;>>> (* 4.0 (monte-carlo 1000 unit-circle-test))
;: 3.076
;>>> (* 4.0 (monte-carlo 10000 unit-circle-test))
;: 3.1144
;>>> (* 4.0 (monte-carlo 100000 unit-circle-test))
;: 3.14748
;>>> (* 4.0 (monte-carlo 1000000 unit-circle-test))
;: 3.146112
;>>> (* 4.0 (monte-carlo 10000000 unit-circle-test))
;: 3.1423176
```

***

**练习 3.6** 有时也需要能重置随机数生成器，以便从某个给定值开始生成随机数序列。请重新设计一个 `rand` 过程，使得我们可以用符号 `generate` 或者符号 `reset` 作为参数去调用它。其行为是：`(rand 'generate)` 将产生出一个新随机数，`((rand 'reset) <new-value>)` 将内部状态变量重新设置为指定的值 `<new-value>`。通过这样重置状态，我们就可以重复生成同样的序列。在使用随机数测试程序，排除其中错误时，这种功能非常有用。

```scheme
#lang sicp

(define random-init 0)

(define (rand-update x)
  (+ x 1))

(define rand
  (let ((x random-init))
    (define (generate)
      (set! x (rand-update x))
      x)
    (define (reset init)
      (set! x init))
    (define (dispatch message)
      (cond ((eq? message 'generate) (generate))
            ((eq? message 'reset) reset)
            (else (error "Unknown request -- RAND"
                         message))))
    dispatch))


;>>> (rand 'generate)
;: 1
;>>> (rand 'generate)
;: 2
;>>> (rand 'generate)
;: 3

;>>> ((rand 'reset) 752)
;>>> (rand 'generate)
;: 753
;>>> (rand 'generate)
;: 754
;>>> (rand 'generate)
;: 755
```

***

**练习 3.7** 考虑如 **练习 3.3** 所描述的，由 `make-account` 创建的带有密码的银行账户对象。假定我们的银行系统中需要一种提供共用账户的能力。请定义过程 `make-joint` 创建这种账户。`make-joint` 应该有三个参数：第一个是有密码保护的账户；第二个参数是一个 密码，它必须与那个已经定义的账户的密码匹配，以使 `make-joint` 操作能够继续下去；第三个参数是新密码。`make-joint` 用这一新密码创建起对那个原有账户的另一访问途径。例如，如果 `peter-acc` 是一个具有密码 `open-sesame` 的银行账户，那么

```
(define paul-acc
  (make-joint peter-acc 'open-sesame 'rosebud))
```

将使我们可以通过名字 `paul-acc` 和密码 `rosebud` 对账户 `peter-acc` 做现金交易。你可能希望修改自己对 **练习 3.3** 的解，加入这一新功能。

```scheme
#lang sicp

(define (make-account balance password)
  (define (withdraw amount)
    (if (>= balance amount)
        (begin (set! balance (- balance amount))
               balance)
        "Insufficient funds"))
  (define (deposit amount)
    (begin (set! balance (+ balance amount))
           balance))
  (define (check-password pass)
    (if (eq? pass password)
        #t
        #f))
  (define (dispatch pass m)
    (if (eq? m 'check-password)
        (check-password pass)
        (if (check-password pass)
            (cond ((eq? m 'withdraw) withdraw)
                  ((eq? m 'deposit) deposit)
                  (else (error "Unknown request -- MAKE-ACCOUNT"
                               m)))
            (lambda (arg . args)
              "Incorrect password"))))
  dispatch)

(define (make-joint account password my-password)
  (if (account password 'check-password)
      (lambda (pass m)
        (if (eq? pass my-password)
            (account password m)
            (lambda (arg . args)
              "Incorrect user password")))
      (lambda (arg . args)
        "Incorrect admin password")))
        

(define peter-acc (make-account 100 'open-sesame))

(define paul-acc
  (make-joint peter-acc 'open-sesame 'rosebud))

(define bob-acc
  (make-joint peter-acc 'pass 'haha))

;>>> (bob-acc 'test 'test)
;: "Incorrect admin password"
;>>> ((peter-acc 'open-sesame 'withdraw) 50)
;: 50
;>>> ((peter-acc 'open-sesame 'deposit) 50)
;: 100
;>>> ((paul-acc 'rosebud 'withdraw) 40)
;: 60
;>>> ((paul-acc 'rosebud 'withdraw) 40)
;: 20
;>>> ((paul-acc 'rosebud 'withdraw) 40)
;: "Insufficient funds"
;>>> ((paul-acc 'open-sesame 'withdraw) 40)
;: "Incorrect user password"
;>>> ((peter-acc 'open-sesame 'deposit) 50)
;: 70
```

***

**练习 3.8** 在 **1.1.3 节** 定义求值模型时我们说过，求值一个表达式的第一步就是求值其中的子表达式。但那时并没有说明应该按怎样的顺序对这些子表达式求值（例如，是从左到右还是从右到左）。当我们引进了赋值之后，对一个过程的各个参数的求值顺序不同就可能导致不同的结果。请定义一个简单的过程 `f`，使得 `(+ (f 0) (f 1))` 的求值在对实际参数采用从左到右的求值顺序时返回 `0`，而对实际参数采用从右到左的求值顺序时返回 `1`。

```scheme
#lang sicp

(define (f-builder flag)
  (lambda (x)
    (begin (set! flag (- flag 1))
           (* x flag))))


;>>> (define f (f-builder 2))

;>>> (define ff (f-builder 2))

;>>> (+ (f 0) (f 1))
;: 0

;>>> (+ (ff 1) (ff 0))
;: 1
```

***

**练习 3.9** 在 **1.2.1 节** 里，我们用代换模型分析了两个计算阶乘的函数，递归版本：

```
(define (factorial n)
  (if (= n 1)
      1
      (* n (factorial (- n 1)))))
```

和迭代版本：

```
(define (factorial n)
  (fact-iter 1 1 n))

(define (fact-iter product counter max-count)
  (if (> counter max-count)
      product
      (fact-iter (* counter product)
                 (+ counter 1)
                 max-count)))
```

请说明采用过程 `factorial` 的上述版本求值 `(factorial 6)` 时所创建的环境结构。

![image]({{ image_path('3.9.svg') }})
{: style="margin: 0 auto; width: 95%;"}

***

**练习 3.10** 在 `make-withdraw` 过程里，局部变量 `balance` 是作为 `make-withdraw` 的参数创建的。我们也可以显式地通过使用 `let` 创建局部状态变量，就像下面所做的：

```
(define (make-withdraw initial-amount)
  (let ((balance initial-amount))
    (lambda (amount)
      (if (>= balance amount)
          (begin (set! balance (- balance amount))
                 balance)
          "Insufficient funds"))))
```

请重温 **1.3.2 节**，`let` 实际上是一个过程调用的语法糖衣：

```
(let ((<var> <exp>)) <body>)
```

它将被解释为

```
((lambda (<var>) <body>) <exp>)
```

的另一种语法形式。请用环境模型分析 `make-withdraw` 的这个版本，画出像上面那样的图示，说明调用：

```
(define W1 (make-withdraw 100))

(W1 50)

(define W2 (make-withdraw 100))
```

时的情况并阐释 `make-withdraw` 的这两个版本创建出的对象具有相同的行为。两个版本的环境结构有什么不同吗？

***

