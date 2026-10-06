"""Experimental, unthrottled adaptive Kuramoto verification.

Sine/cosine use dimensionless radian arguments. The harness has no safety
barrier, target feedback, progress injection, actuator, or network access.
The supplied parameter set is frozen, not tuned.
"""
import json
import numpy as np
from scipy.integrate import solve_ivp

def user_harness(N=10,T=50.,dt=.01,gamma=.5,alpha=.3,K0=1.,seed=42,
                 initial_phases=None, natural_frequencies=None, initial_gains=None):
    """Offline Euler experiment; no policy decisions or external effects."""
    if not isinstance(N,int) or isinstance(N,bool) or N<2:
        raise ValueError("N must be an integer >= 2")
    if not isinstance(seed,int) or isinstance(seed,bool) or not 0 <= seed < 2**32:
        raise ValueError("seed must be a fixed integer in [0, 2**32)")
    if not np.all(np.isfinite([T,dt,gamma,alpha,K0])):
        raise ValueError("parameters must be finite")
    if T<=0 or dt<=0 or gamma<0 or alpha<0:
        raise ValueError("require T, dt > 0 and gamma, alpha >= 0")
    if gamma*dt>1:
        raise ValueError("require gamma*dt <= 1 for Euler gain invariance")
    step_count=round(T/dt)
    if step_count<1 or not np.isclose(step_count*dt,T,rtol=1e-12,atol=1e-12):
        raise ValueError("T must be a positive integer multiple of dt")
    rng=np.random.RandomState(seed)
    steps=step_count
    t=dt*np.arange(steps)
    omega=rng.normal(0,.5,N);omega-=omega.mean()
    theta=rng.uniform(0,2*np.pi,N)
    if initial_phases is not None:
        theta=np.array(initial_phases,dtype=float,copy=True)
    if natural_frequencies is not None:
        omega=np.array(natural_frequencies,dtype=float,copy=True)
    if theta.shape!=(N,) or omega.shape!=(N,) or not np.all(np.isfinite(np.r_[theta,omega])):
        raise ValueError("phase and frequency vectors must be finite and length N")
    A=np.ones((N,N))-np.eye(N);mask=A==1
    K=np.full((N,N),K0)
    if initial_gains is not None:
        candidate=np.asarray(initial_gains,dtype=float)
        K=np.full((N,N),float(candidate)) if candidate.ndim==0 else candidate.copy()
    if K.shape!=(N,N) or not np.all(np.isfinite(K)) or not np.array_equal(K,K.T):
        raise ValueError("initial gains must be a finite scalar or symmetric N-by-N matrix")
    bound_low=np.minimum(K,K0-alpha/gamma) if gamma>0 else None
    bound_high=np.maximum(K,K0+alpha/gamma) if gamma>0 else None
    max_bound_excess=None
    def record_bound_excess(gains):
        if gamma==0:
            return None
        return float(max(np.max((bound_low-gains)[mask]),
                         np.max((gains-bound_high)[mask])))
    Rh=np.zeros(steps);Kh=np.zeros(steps)
    edge_lo=np.inf;edge_hi=-np.inf
    tail_edge_lo=np.inf;tail_edge_hi=-np.inf
    for s in range(steps):
        if gamma>0:
            excess=record_bound_excess(K)
            max_bound_excess=excess if max_bound_excess is None else max(max_bound_excess,excess)
        Rh[s]=abs(np.mean(np.exp(1j*theta)))
        Kh[s]=K[mask].mean()
        edge_lo=min(edge_lo,float(K[mask].min()))
        edge_hi=max(edge_hi,float(K[mask].max()))
        if s >= max(0,steps-100):
            tail_edge_lo=min(tail_edge_lo,float(K[mask].min()))
            tail_edge_hi=max(tail_edge_hi,float(K[mask].max()))
        diff=theta[None,:]-theta[:,None]
        dtheta=omega+np.sum(A*K*np.sin(diff),axis=1)
        dK=(-gamma*(K-K0)+alpha*np.cos(diff))*A
        theta=(theta+dtheta*dt)%(2*np.pi)
        K=K+dt*dK
    if gamma>0:
        max_bound_excess=max(max_bound_excess,record_bound_excess(K))
    return {"printed_final_100_mean_K_range":[float(Kh[-100:].min()),float(Kh[-100:].max())],
    "last_recorded_R":float(Rh[-1]),"last_recorded_mean_K":float(Kh[-1]),
    "all_recorded_edge_K_range":[edge_lo,edge_hi],
    "last_100_recorded_edge_K_range":[tail_edge_lo,tail_edge_hi],
    "last_recorded_edge_K_range":[float((K-dt*dK)[mask].min()),float((K-dt*dK)[mask].max())],
    "integrated_endpoint_edge_K_range":[float(K[mask].min()),float(K[mask].max())],
    "integrated_endpoint_mean_K":float(K[mask].mean()),
    "integrated_endpoint_R":float(abs(np.mean(np.exp(1j*theta)))),
    "max_edge_bound_excess":max_bound_excess,
    "last_record_time_actual":float((steps-1)*dt),
    "last_record_time_returned":float(t[-1]),
    "dt":float(dt),"endpoint_time":float(steps*dt)}

def ode_reference(gamma=.5):
    N=10
    rng=np.random.RandomState(42)
    omega=rng.normal(0,.5,N);omega-=omega.mean()
    theta=rng.uniform(0,2*np.pi,N)
    ii,jj=np.triu_indices(N,1);E=len(ii)
    def rhs(t,y):
        th=y[:N];k=y[N:]
        d=th[jj]-th[ii]
        q=k*np.sin(d)
        vel=omega.copy()
        np.add.at(vel,ii,q);np.add.at(vel,jj,-q)
        return np.r_[vel,-gamma*(k-1)+.3*np.cos(d)]
    sol=solve_ivp(rhs,[0,50],np.r_[theta,np.ones(E)],rtol=1e-10,atol=1e-12,max_step=.02,dense_output=True)
    if not sol.success:raise RuntimeError(sol.message)
    grid=np.linspace(0,50,50001)
    edge_grid=sol.sol(grid)[N:]
    recorded=sol.sol(49.99)[N:]
    return {"gamma":gamma,"endpoint_R":float(abs(np.mean(np.exp(1j*sol.y[:N,-1])))),
    "endpoint_mean_K":float(sol.y[N:,-1].mean()),
    "endpoint_edge_K_range":[float(sol.y[N:,-1].min()),float(sol.y[N:,-1].max())],
    "mean_K_at_49_99":float(recorded.mean()),
    "sampled_edge_K_range_0_to_50":[float(edge_grid.min()),float(edge_grid.max())],
    "sampling_interval_for_minimum":.001,"rtol":1e-10,"atol":1e-12,
    "max_step":.02,"solver_success":bool(sol.success)}

def verification_suite():
    """Synthetic fixtures and solver comparisons; not acceptance evidence."""
    # Exact states, rather than favorable random examples.
    # In-phase equal frequencies: sin=0, cos=1. Damped K tends to K0+alpha/gamma.
    # Undamped K=K0+alpha*t and R=1.
    T=50.;K0=1.;alpha=.3;gamma=.5
    exact_sync={"undamped_K_at_50":K0+alpha*T,
    "damped_K_at_50":K0+alpha/gamma*(1-np.exp(-gamma*T)),
    "R_all_times":1.,"theta_velocity_for_zero_frequencies":0.}
    # Two nodes exactly antiphase, omega=0, safety S(t)=t, beta=1:
    # Kdot=-gamma(K-K0)-alpha-beta*t, K(0)=K0.
    beta=1.
    k_antiphase=K0-alpha/gamma*(1-np.exp(-gamma*T))-beta*(T/gamma-(1-np.exp(-gamma*T))/gamma**2)
    # A common injection epsilon adds rotation, leaving phase differences and R unchanged.
    common_injection={"frequency_injection":.1,"R_all_times":1.,
    "phase_motion_nonzero":True,"target_R":float((np.sqrt(5)-1)/2),
    "target_error_all_times":float(1-(np.sqrt(5)-1)/2)}
    res={"user_damped":user_harness(),"user_undamped":user_harness(gamma=0),
    "damped_step_refinement":{str(dt):user_harness(dt=dt) for dt in [.005,.0025]},
    "damped_ode_reference":ode_reference(),
    "undamped_step_refinement":{str(dt):user_harness(dt=dt,gamma=0) for dt in [.005,.0025]},
    "undamped_ode_reference":ode_reference(gamma=0),
    "exact_synchronized_counterexample":exact_sync,
    "unbounded_nonnegative_safety_input_counterexample":{"S":"t","antiphase_K_at_50":float(k_antiphase),"asymptotic":"K decreases without bound approximately -(beta/gamma)*t"},
    "common_injection_counterexample":common_injection}
    return res

if __name__ == "__main__":
    print(json.dumps(verification_suite(),indent=2,allow_nan=False))
