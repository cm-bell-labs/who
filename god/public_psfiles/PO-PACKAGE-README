
                   PARTIAL-ORDER PACKAGE FOR SPIN

SPIN

SPIN is an automated validation system for communication protocols
described in the PROMELA language.  SPIN performs an exploration of
the protocol state space by using a classical depth-first search
algorithm. This algorithm recursively explores all successor states of
all states encountered during the search, starting from the initial
state, by executing all enabled transitions in each state. Of course,
the number of visited states can be very large: this is the well-known
state-explosion problem, which limits the applicability of state-space
exploration techniques.

(the Spin system can be obtained by anonymous ftp from netlib.att.com
from the /netlib/spin directory)


PARTIAL-ORDER PACKAGE

The Partial-Order Package implements a combination of several
verification techniques that attempt to avoid the part of the state
explosion due to the exploration of all possible interleavings of
concurrent transitions. These techniques verify properties of systems
by exploring as few interleavings as possible for each partial order
execution that the system can perform. The other interleavings are not
explored.


PARTIAL-ORDER PACKAGE FOR SPIN

The Partial-Order Package includes algorithms for generating such
reduced state spaces from any PROMELA program and for checking
deadlocks, unreachable code and assertion violations.

The Partial-Order Package must be used in conjunction with the SPIN
system. It does not change the overall functionalities of SPIN (except
for the restrictions listed below), its use is transparent for the
user.

Using the Partial-Order Package decreases the resource requirements of
the validation: the memory and time requirements are usually much
smaller when using the Package than without using it. Therefore, it
also broadens the applicability of SPIN to more complex protocols.


INSTALLATION OF THE PARTIAL-ORDER PACKAGE

     1.  In a new directory, copy the file po-pack.tar.Z

     2.  Type in the following unix commands:

		uncompress po-pack.tar.Z
		tar xvf po-pack.tar

     3.  run make in the PO-PACKAGE directory


USING THE PARTIAL-ORDER PACKAGE

The use of SPIN with the Partial-Order Package remains very similar to
the use of SPIN alone. The validation of a PROMELA program can be
performed as follows:

     $ spin -a filename (build the validator)

     $ cc -c pan.c (compile the validator)

     $ cc -c po.c (compile partial-order functions)

     $ cc -o pan pan.o po.o (link the object code with the PO-
     Package-functions object code)

     $ pan (run the validator)

By default, the validator reports deadlocks, unreachable code and
assertion violations. In order to detect deadlocks only, use the
DEADLOCK option as follows (the reduced state-space can be further
reduced when searching for deadlocks only):

     $ cc -DDEADLOCK -c pan.c
     $ cc -DDEADLOCK -c po.c
     $ cc -o pan pan.o po.o


Note that the current version of the Partial-Order Package is not
compatible with XSPIN.

RESTRICTIONS

During the validation, some PO-Package functions use information about
which processes can access which variables. In order to ensure a
proper functioning of the PO Package, the PROMELA program under validation
has to meet the following requirements:

1.  The init process must be an atomic sequence where all global
variables are initialized, and all processes of the system are created.
Process creation is not allowed in the rest of the program.

2.  Channels must be declared as global variables or as parameters of a
process type. Remote references in a process to variables local to
other processes are forbidden.
 
3.  Inside atomic sequences (except in the init process), indices of
shared arrays and channel identifiers cannot be side effected. For
instance, the atomic sequences "atomic{i=i+1;table[i]=any}" and
"atomic{qname=q3;qname!any}" are forbidden.

4.  Inside atomic sequences (except in the init process), a transition
that modifies the value of a shared object, i.e., a shared variable or
channel, cannot be followed by another transition that accesses (read
or write) this object in the remainder of the atomic sequence. For
instance, the atomic sequence "atomic{q!any1;q!any2}" is forbidden.

5.  The atomic sequences must be deterministic, i.e., from one state,
the execution of an atomic sequence cannot lead to more than one
successor state.

6.  The "send" and "receive" on capacity 0 channel cannot appear in
atomic sequences. For instance if q is a capacity 0 channel, the
atomic sequence "atomic{ <statements>; q!any}" is forbidden.

7.  The predicate "len(chan)" is still supported, but it should be
replaced whenever possible by using the new predicates "empty" and
"full" whose semantics is defined as follows:

	"empty(chan)" returns true if the channel chan is empty,
	else it returns false;

	"full(chan)" returns true if the channel chan is full,
	else it returns false.

Refined optimizations for these two predicates have been implemented
in the PO Package. These optimizations may yield substantial
efficiency improvements.

8.  The validation of liveness properties (i.e., non-progress and
acceptance cycle detection and never-claim violation) is not supported
by the current version of the PO Package. It will be supported in a
forthcoming version.


BIT-STATE HASHING

The supertrace option -DBITSTATE of SPIN is compatible with the PO
Package. They can be used simultaneously by compiling the pan.c file
as follows:

     $ cc -DBITSTATE -c pan.c
     $ cc -DBITSTATE -c po.c
     $ cc -o pan pan.o po.o


STATE-SPACE CACHING

The PO Package also includes an implementation of a "State-Space
Caching" technique.  State-space caching is a state-space exploration
method that consists of storing all states of the current path being
explored (i.e., those in the current depth-first "stack") plus as many
previously visited states as possible given the remaining amount of
available memory. It creates a restricted "cache" of selected system
states that have already been visited. Initially, all states
encountered are stored into the cache.  When the cache fills up, old
states are deleted to accommodate new ones. This method never tries to
store more states than possible in the cache. If the size of the cache
is greater than the maximal size of the stack during the exploration,
the whole state space can be explored. Thanks to state-space caching,
the memory requirements needed to analyze protocols can be decreased
at the price of increasing the time requirements. It has been recently
shown that state-space caching and partial-order methods combine very
well: the memory requirements needed to validate large protocol models
can be strongly decreased (e.g., more than 100 times) without
seriously increasing the time requirements.
 
A new option -nC specifying the maximum number C of states that can be
stored in memory (i.e., the size of the cache) has been added to the
executable file pan. If the explored state space is too large to be
stored in memory, even when using the Partial-Order Package, try the
state space caching option:

     $ pan -nC -wN

where C is the maximum number of states that can be stored in main
memory (C is typically set to slightly less than M/S where M is the
amount of RAM of your computer and S is the state vector size, which
is indicated in the diagnosis produced by SPIN; C must be small enough
to avoid paging) and where N is chosen in such a way that 2^N is as
close as possible to 2*C (in order to have a hash table at 50% not
full).

(Note: from Version 3.1 of the Partial-Order Package, states that are
in the current depth-first search stack are not removed from the
cache. When most of the states in the cache may not be removed because
they are in the stack, a warning is issued, and the cache size should
be increased if possible, in order to avoid significant run-time
overhead due to scanning the cache to look for states not in the
stack.)


MORE

This Partial-Order Package is distributed free of charge for research
and educational use only. No guarantee is expressed or implied by the
distribution of this code.

Software written by Patrice Godefroid, Didier Pirottin and Pierre
Wolper, Computer Science Department, University of Liege, with the
collaboration of Gerard J. Holzmann, AT&T Bell Laboratories. 

The main reference describing the algorithms implemented in the
Partial-Order Package and presenting results of experimentations is
"Partial-order Methods for the Verification of Concurrent Systems --
An Approach to the State-Explosion Problem", Patrice Godefroid, PhD
thesis, November 1994. This document is available in this directory
(file thesis.ps.Z).

A revised version of this PhD thesis is published by Springer-Verlag,
as volume 1032 of Lecture Notes in Computer Science, January
1996. (ISBN 3-540-60761-7)

Please send your comments, questions, bug-reports and results of
experiments to: po-package@montefiore.ulg.ac.be


Patrice Godefroid, Didier Pirottin and Pierre Wolper

University of Liege
Institut Montefiore, B28
4000 Liege Sart-Tilman
Belgium
