function [bestu] = exhsearch(M,L);
%
% function [bestu] = exhsearch(M,L);
%
% Exhaustive search for the best multiple antenna diagonal constellation
% according to the paper B. Howchald and W. Sweldens, "Differential
% Unitary Space Time Modulation" (http://mars.bell-labs.com)
%
% M = number of antenna
% L = number of matrices in the constellation
% bestu = best modulation speeds for each of the antenna
%
% The program does an exhaustive search and prints out every time it
% improves the current best solution. It also logs a copy in a file
% randsearch.M=%d.L=%d.res. Caveat: The running time is O(L^M).
%
% Various optimizations from the paper are implemented.

%
% Copyright (C) Wim Sweldens (wim@lucent.com) 1999, 2000.
%
% This program is distributed under the GNU General Public License
% http://www.gnu.org/copyleft/gpl.html


% Compute rate
R = log(L)/log(2)/M; 

% File for logging
fname = sprintf('exhsearch.M=%d.L=%d.res',M,L);

% Precompute the abs(sin(pi*l/L))^(1/M)
psin = zeros(1,L-1);
for l=1:L-1
  psin(l) = abs(sin(pi*l/L))^(1/M);
end;


% Get all u that are relative prime with L and < L/2
ulist = listrelprime(L);
lenulist = length(ulist);

% Limit range of minimization for l
lrange = 1:floor((L-1)/2); % L/2-1 if L even and (L-1)/2 if L odd

% Initialization
n = 0;
uind = ones(1,M);
u = ulist(uind);
bestzeta = 0;
comp = M;

while 1

  n = n+1;
  
  % Compute zeta using a MxL matrix multiplied per column
  zeta = min(prod(psin(mod(u'*lrange,L))));  

  % If current best, dump out
  if ( zeta > bestzeta )
    FID = fopen(fname,'a');
    fprintf(FID,'M=%1d L=%1d R=%4.2f n=%4d zeta=%10.6e u= [%1d', ...
 	M,L,R,n,zeta,u(1));
    fprintf(1,'M=%1d L=%1d R=%4.2f n=%4d zeta=%10.6e  u= [%1d', ...
 	M,L,R,n,zeta,u(1));
    for j=2:M 
      fprintf(FID,' %1d',u(j));
      fprintf(1,' %1d',u(j));
    end;
    fprintf(FID,']\n');
    fprintf(1,']\n');
    fclose(FID);
    bestu = u;
    bestzeta = zeta;
  end;

  % Implement odometer for uind (index into the ulist)
  % First find the component that needs to roll over  
  while uind(comp) == lenulist,
    comp = comp - 1;
  end
  
  % If first component, then we are done (first stays 1 all the time)
  if comp == 1, break; end; 
  
  % Roll over
  uind(comp) = uind(comp) + 1;
  
  % Set lower indices to the current compoment (maintain sorted list)
  uind(comp+1:M) = uind(comp) * ones(1,M-comp); 
  
  % Next roll over is at the end
  comp = M;
  
  % Create next u
  u = ulist(uind);
end;

 






