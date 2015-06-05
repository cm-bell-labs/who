/****************************************************************************
* Copyright (C)2002 Lucent Technologies                                     *
* (clarkson@research.bell-labs.com http://cm.bell-labs.com/who/clarkson)    *
*                                                                           *
* This program is free software; you can redistribute it and/or             *
* modify it under the terms of the GNU General Public License               *
* as published by the Free Software Foundation; either                      *
* version 2 of the License, or (at your option) any later version.          *
*                                                                           *
* This program is distributed in the hope that it will be useful,           *
* but WITHOUT ANY WARRANTY; without even the implied warranty of            *
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the             *
* GNU General Public License for more details.                              *
*                                                                           *
* You should have received a copy of the GNU General Public License         *
* along with this program; if not, write to the Free Software               *
* Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA,                 *
* or visit http://www.gnu.org/licenses/gpl.html                             *
*****************************************************************************/


#ifdef __cplusplus
extern "C" {
#endif

	/**************************************************************************
	*	user-supplied: given i and j, should return distance between 
	*		point i and point j;		
	***************************************************************************/

typedef float (*sb_distance)(size_t i, size_t j);

typedef struct sb *sbp; /* The data structure to be built and used */



	/**************************************************************************
	*	search structure sb
	*		build using build_sb or build_sbp,
	*		search using search_sb, or one of the variants
	*		free using free_sb
	***************************************************************************/

void free_sb(sbp);

sbp build_sb(	/* the simple version */
	sb_distance F, 		/* pointer to distance function  */
	size_t num_sites 	/* number of sites */
); 

sbp build_sbp(	/* with performance heuristics */
	sb_distance F, 		/* pointer to distance function  */
	size_t num_sites, 	/* number of sites */
	float end_frac, 	/* affects performance only; default 0.1 */
	char packing,		/* affects performance only; default 1 */
	sb_distance dist2	/* function to be used (in future) for speedup */
);


	/**************************************************************************
	* given sbp built by build_sb, and q, a site number,
	*	returns nearest site to q; for alpha < 1, returns
	*	a site within 1/alpha of nearest
	***************************************************************************/

typedef size_t search_sb_f(
	sbp sbt,			/* data structure built by build_sb */
	size_t query,		/* number of query site; typically num_sites+1 */
	float alpha			/* should have 0<alpha<=1; inexact search for alpha<1 */
);

search_sb_f search_sb; /* the default, the version which seems best overall */



/* used for fixed_radius and k-nearest */

typedef struct SD {
    int point;		/* index of site */
    float key;		/* generally, distance between this site and query point */
} SD;


	/**************************************************************************
	*	k-nearest: function v(i) is executed for each i that is in first k nearest sites
	*              ties for k'th-nearest are broken arbitrarily
        *              query site itself is not included
	**************************************************************************/

void search_sb_k_nearest(sbp, size_t q, size_t k, void (*v)(SD*));



	/**************************************************************************
	*	fixed radius searching: report number of sites within radius of q
	*		function v(i) is executed for each i with d(i, q) < r
        *               query site itself is not reported
	**************************************************************************/

size_t search_sb_fixed_r(sbp, size_t q, float radius, void (*v)(SD*));


/* utilities */

size_t inserted(sbp sbt, size_t i);
		/* return i'th site inserted: may be useful for cluster analysis
			when packing==1*/

size_t size_lists(sbp sbt); /* return total number of DL entries */



	/**************************************************************************
	* specific search methods, for experimental comparison	
	**************************************************************************/

search_sb_f
	search_sb_d_order,	/* these functions use slightly different algorithms to answer queries */
	search_sb_i_order,
	search_sb_stack,
	search_sb_semi_heap,
	search_sb_no_heap;


typedef enum {ignore, prep, query, a_verify} activities;
extern activities activity;

#ifdef __cplusplus
}
#endif
