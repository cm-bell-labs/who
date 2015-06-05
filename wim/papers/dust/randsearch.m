function [bestu] = randsearch(M,L,varargin);
%
% function [bestu] = randsearch(M,L,optional N);
%
% Random search for the best multiple antenna diagonal constellation
% according to the paper B. Howchald and W. Sweldens, "Differential
% Unitary Space Time Modulation" (http://mars.bell-labs.com)
%
% M = number of antenna
% L = number of matrices in the constellation
% N = number of tries (default = 10K)
% bestu = "best" modulation speeds for each of the antenna
%
% The program does a random search and prints out every time
% it improves the current best solution. It also logs a copy
% in a file randsearch.M=%d.L=%d.res.
%
% Various optimizations from the paper are implemented.
%
% Copyright (C) Wim Sweldens (wim@lucent.com) 1999, 2000.
%
% This program is distributed under the GNU General Public License
% http://www.gnu.org/copyleft/gpl.html


% Compute the rate
R = log(L)/log(2)/M;

% Figure out how many runs are needed
if length(varargin) == 0,
  N = 10000;
elseif length(varargin) == 1,
  N = varargin{:};
else
  error('Wrong number of inputs: randsearch(M,L,optional N)');
end;

% File name for logging
fname = sprintf('randsearch.M=%d.L=%d.res',M,L);

% Precompute the abs(sin(pi*l/L))^(1/M)
psin = zeros(1,L-1);
for l=1:L-1
  psin(l) = abs(sin(pi*l/L))^(1/M);
end;

% Get all the u's that are relative prime with L and < L/2
ulist = listrelprime(L);
lenulist = length(ulist);

% Limit range of minimization for l
lrange = 1:floor((L-1)/2); % L/2-1 if L even and (L-1)/2 if L odd

% Initialization
bestzeta = 0;
bestu = zeros(1,M);

for n=1:N
  % Get random u candidate u(1)=1, rest come from the ulist
  u  = [ 1 ulist(sort([ ceil(rand(1,M-1)*lenulist)]))]; 
  
  % Compute zeta using a MxL matrix multiplied per column
  zeta = min(prod(psin(mod(u'*lrange,L))));

  % If current best, dump out
  if ( zeta > bestzeta )
    FID = fopen(fname,'a');
    fprintf(FID,'M=%1d L=%1d R=%4.2f n=%4d zeta=%10.6e u= [%1d', ...
	M,L,R,n,zeta,u(1));
    fprintf(1,'M=%1d L=%1d R=%4.2f n=%4d  zeta=%10.6e  u= [%1d', ...
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
end;




