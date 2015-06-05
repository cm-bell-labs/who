function ulist = listrelprime(L);
  
maxu = floor((L-1)/2); % L/2 -1 if L even and (L-1)/2 if L odd
relprime = ones(1,maxu); % boolean only till maxu

factors = unique(factor(L));

for j=1:length(factors);
  f = factors(j);
  F = f;
  while F <= maxu;
    relprime(F) = 0;
    F = F+f;
  end;
end;

ulist = find(relprime);