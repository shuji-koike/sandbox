package main

import (
	"fmt"
)

// https://atcoder.jp/contests/abc158/tasks/abc158_c
func main() {
	var a, b int
	fmt.Scanf("%d %d", &a, &b)
	if int(float32(a*100/8)*0.1) == b {
		fmt.Println(a * 100 / 8)
	} else {
		fmt.Println(-1)
	}
	println(a*100/8, b*100/10)
}

// https://atcoder.jp/contests/abc158/tasks/abc158_b
// func main() {
// 	var n, a, b, output int
// 	fmt.Scanf("%d %d %d", &n, &a, &b)
// 	output = n / (a + b) * a
// 	if n%(a+b) < a {
// 		output += n % (a + b)
// 	} else {
// 		output += a
// 	}
// 	fmt.Println(output)
// }

// https://atcoder.jp/contests/abc158/tasks/abc158_a
// func main() {
// 	var s string
// 	fmt.Scanf("%s", &s)
// 	if s == "AAA" || s == "BBB" {
// 		fmt.Println("No")
// 	} else {
// 		fmt.Println("Yes")
// 	}
// }

// https://atcoder.jp/contests/abs/tasks/abc083_b
// func main() {
// 	var n, a, b int
// 	fmt.Scanf("%d %d %d", &n, &a, &b)
// 	println(n, a, b)
// 	sum := 0
// 	for i := 1; i <= n; i++ {
// 		s := 0
// 		for _, e := range strconv.Itoa(i) {
// 			c, _ := strconv.Atoi(string(e))
// 			s += c
// 		}
// 		// println(i, s, a <= s && s <= b)
// 		if a <= s && s <= b {
// 			sum += i
// 		}
// 	}
// 	fmt.Println(sum)
// }

// https://atcoder.jp/contests/abs/tasks/abc087_b
// func main() {
// 	var a, b, c, x int
// 	fmt.Scanf("%d", &a)
// 	fmt.Scanf("%d", &b)
// 	fmt.Scanf("%d", &c)
// 	fmt.Scanf("%d", &x)
// 	count := 0
// 	for an := 0; an <= x/500; an++ {
// 		for bn := 0; bn <= (x-an*500)/100; bn++ {
// 			cn := (x - an*500 - bn*100) / 50
// 			if an <= a && bn <= b && cn <= c {
// 				count++
// 				println(an, bn, cn)
// 			}
// 		}
// 	}
// 	fmt.Println(count)
// }
