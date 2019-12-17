// interface Iso<T> {
//     [key: T]: T
// }

type X<H> = H

// function contains<T>(x: T): void {
// }

interface NumberIso {
    0: keyof NumberIso,
    1: keyof NumberIso
    2: keyof NumberIso
    3: keyof NumberIso
    4: keyof NumberIso
    5: keyof NumberIso
    6: keyof NumberIso
    7: keyof NumberIso
    8: keyof NumberIso
    9: keyof NumberIso
}

interface Incr extends NumberIso {
    0: 1,
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 6,
    6: 7,
    7: 8,
    8: 9,
    9: 9,
}

type C0<F extends NumberIso, X extends keyof NumberIso> = X
type C1<F extends NumberIso, X extends keyof NumberIso> = F[X]
type C2<F extends NumberIso, X extends keyof NumberIso> = F[F[X]]
type C3<F extends NumberIso, X extends keyof NumberIso> = F[F[F[X]]]
type C4<F extends NumberIso, X extends keyof NumberIso> = F[F[F[F[X]]]]

contains<C0<Incr, 0>>(0)
contains<C1<Incr, 0>>(1)
contains<C2<Incr, 0>>(2)
contains<C3<Incr, 0>>(3)
contains<C3<Incr, 0>>(4) // doesn't typecheck


// This isn't fucking working
type SC<N extends NumberIso, F extends NumberIso, X extends keyof NumberIso> = F[N[F][X]]



// #Arithmetic
// #Count
// S = lambda n: lambda f: lambda x: f(n(f)(x))
// ADDS = lambda m: lambda n: m(S)(n) #"start from n", consider "apply the successor function", repeat "m times"
// MUL = lambda m: lambda n: m(ADDS(n))(N0) #From ZERO, consider "ADD n", do this "m times"
// POW = lambda b: lambda e: e(b) #