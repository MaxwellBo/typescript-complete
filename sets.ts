function contains<T>(x: T): void {
}

contains<true>(true)
contains<false>(false)
contains<0>(0)
contains<'literal'>('literal')

// In languages with a structural type system, the top type is the empty structure. 
type Top = {} // ⊤ 
type Bottom = never // ⊥

let TOP: Top
let BOTTOM: Bottom

contains<Top>('literally everything')

contains<Bottom>(null) 
contains<Bottom>(undefined)

// #############################################################################
// SUBSET

// extends is equivalent to the ⊂ operator
const _1In1And2: 1 extends (1 | 2) ? true : false = true
const _1In2:     1 extends (2)     ? true : false = false

function assert<T extends true>(): void {
}

type BadSubset<A, B> = A extends B ? true : false

contains<BadSubset<2 | 3, 3>>(true)
contains<BadSubset<2 | 3, 3>>(false)
// wat
//  BadSubset<2 | 3, 3> is boolean!?

// This is because of "Distributive Conditional Types"

// Conditional types in which the checked type is a naked type parameter are called distributive conditional types. 
// Distributive conditional types are automatically distributed over union types during instantiation.

// `T extends U ? X : Y` with the type argument `A | B | C` for `T` is resolved as 
// `(A extends U ? X : Y) | (B extends U ? X : Y) | (C extends U ? X : Y)`
// See as follows

type TypeName<T> =
    T extends string ? "string" :
    T extends number ? "number" :
    T extends boolean ? "boolean" :
    T extends undefined ? "undefined" :
    T extends Function ? "function" :
    "object";

type TestTypeNameString   = TypeName<string>;  // "string"
type TestTypeNameA        = TypeName<"a">;  // "string"
type TestTypeNameBoolean  = TypeName<true>;  // "boolean"
type TestTypeNameFunction = TypeName<() => void>;  // "function"
type TestTypeNameObject   = TypeName<string[]>;  // "object"

// Here's where `TypeName` gets distributed over the union:
type TestTypeNameStringOrFunction = TypeName<string | (() => void)>;  // "string" | "function"
type TestTypeNameStringOrObjectOrUndefined = TypeName<string | string[] | undefined>;  // "string" | "object" | "undefined"
type TestTypeNameObject2 = TypeName<string[] | number[]>;  // "object"

// So `Subset<2 | 3, 3>` resolves to `boolean`, 
// because while 2 is not assignable to 3, 3 is assignable to 3, hence `false | true` aka `boolean`

type Subset<A, B> = [A] extends [B] ? true : false
// So we wrap our type arguments in lists so that they aren't "naked", because only _naked_ types are distrubted.

contains<Subset<2 | 3, 3>>(false)
contains<Subset<2 | 3, 3>>(true) // doesn't typecheck. As you can see, it now works!

assert<Subset<2 | 3, 1 | 2 | 3>>()
assert<Subset<string, 'asdf'>>()

const _stringIsSubsetOfAsdf: Subset<'asdf', string> = true

const _asdfListIsSubsetOfStringList: Subset<'asdf'[], string[]> = true
const _stringListIsSubsetOfAsdfList: Subset<string[], 'asdf'[]> = false

// #############################################################################
// BOOLOPS

type And<A, B> = true extends A & B ? true : false
type Or<A, B> = true extends A | B ? true : false

const _testTT: And<true, true> = true
const _testTF: And<true, false> = false
const _testFF: And<false, false> = false
const _testFT: And<false, true> = false

// type Equal<A, B> = true extends ([A] extends [B] ? true : false) & ([B] extends [A] ? true : false) ? true : false
type Equal<A, B> = And<Subset<A, B>, Subset<B, A>>

type T12 = 1 | 2
type T23 =     2 | 3

type T2 = T12 & T23

// https://github.com/Microsoft/TypeScript/issues/9999 here be dragons, `any` is both ⊥ and ⊤, `{}` is the true ⊤ type

let _topUnion: Equal<1 | Top, Top> = true
let _bottomUnion: Equal<1 | Bottom, 1> = true 

let _topIntersection: Equal<1 & Top, 1> = true
let _bottomIntersection: Equal<1 & Bottom, Bottom> = true

// // { true }
// let _testTrueTrueIntersection: true & true = true
// _testTrueIntersection = false // doesn't typecheck


// let _testTrueFalseIntersection: true & false = BOTTOM
// _testTrueFalseIntersection = true // doesn't typecheck
// _testTrueFalseIntersection = false // doesn't typecheck

// const _isTrueIntersection: true extends true & true ? true : false = true
// const _isFalseIntersection: true extends true & false ? true : false = false

// const _testBooleanEquality: Equal<boolean, true | false> = true
// const _testIntersectionInequality: Equal<1 | 2, 2 | 3> = false

// #############################################################################
// Interfaces are equivalent to type functions

type StringToString<A extends string> = string

interface IStringToString {
    [a: string]: string
}

type StringToNumber<A extends string> = number

interface IStringToNumber {
    [a: string]: number
}

type StringToStringOrNumber<T extends string> = StringToString<T> | StringToNumber<T>

type IStringToStringOrNumber = IStringToNumber | IStringToString

let _stringOrNumber: IStringToStringOrNumber['arbitary parameter']
_stringOrNumber = 'string'
_stringOrNumber = 0

let _AlsoStringOrNumber: StringToStringOrNumber<'arbitary parameter'>
_AlsoStringOrNumber = 'string'
_AlsoStringOrNumber = 0

interface NumberCodec {
    0: 'zero',
    'zero': 0
}

const _zeroString: NumberCodec[0] = 'zero';
const _zeroNumber: NumberCodec['zero'] = 0
const _roundtrip:  NumberCodec[NumberCodec['zero']] = 'zero'


interface Incr {
    0: 1,
    1: 2,
    2: 3,
    3: 4
}

interface Decr {
    5: 4,
    4: 3,
    3: 2,
    2: 1,
    1: 0
}


 // https://stackoverflow.com/questions/51687208/how-can-i-do-compile-time-addition-in-typescript
 // https://gist.github.com/utatti/c411d0939094ba490ce6dd78c92ffe4c


 type Nat = 0 | { succ: Nat };

type Succ<T extends Nat> = { succ: T };

type N0  = 0;
type N1  = Succ<N0>;
type N2  = Succ<N1>;
type N3  = Succ<N2>;
type N4  = Succ<N3>;
type N5  = Succ<N4>;
type N6  = Succ<N5>;
type N7  = Succ<N6>;
type N8  = Succ<N7>;
type N9  = Succ<N8>;
type N10 = Succ<N9>;

// type-level add operation
type Add<X extends Nat, Y extends Nat> =
    X extends Succ<infer R> ? { succ: Add<R, Y> } : Y;

// type-level assertion
type Assert<X extends Nat, Y extends Nat> = X extends Y ? any : never;

// test
assert<Equal<Add<N4, N5>, N9>>();
assert<Equal<Add<N1, N3>, N4>>();
assert<Equal<Add<N1, N3>, N5>>();
