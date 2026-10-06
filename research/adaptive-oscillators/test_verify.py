"""Numerical regressions for the research model, not gate/acceptance tests."""
import unittest
import numpy as np
from verify import user_harness


class AdaptiveGainVerification(unittest.TestCase):
    def test_exact_sync_damped_euler_envelope(self):
        result = user_harness(N=2, T=2., dt=.01,
                              initial_phases=[0., 0.], natural_frequencies=[0., 0.])
        expected = 1. + .6 * (1. - (1. - .5 * .01) ** 200)
        self.assertAlmostEqual(result['integrated_endpoint_mean_K'], expected, places=12)
        self.assertLess(result['integrated_endpoint_edge_K_range'][1], 1.6)

    def test_antiphase_damped_lower_envelope(self):
        result = user_harness(N=2, T=2., dt=.01,
                              initial_phases=[0., np.pi], natural_frequencies=[0., 0.])
        expected = 1. - .6 * (1. - (1. - .5 * .01) ** 200)
        self.assertAlmostEqual(result['integrated_endpoint_mean_K'], expected, places=12)
        self.assertGreater(result['integrated_endpoint_edge_K_range'][0], .4)

    def test_undamped_exact_sync_growth(self):
        result = user_harness(N=2, T=2., dt=.01, gamma=0.,
                              initial_phases=[0., 0.], natural_frequencies=[0., 0.])
        self.assertAlmostEqual(result['integrated_endpoint_mean_K'], 1.6, places=12)
        self.assertAlmostEqual(result['integrated_endpoint_R'], 1., places=12)

    def test_every_recorded_edge_inside_interval(self):
        # Analytical comparison bounds, not seed-specific trajectory values.
        for gamma in [.25, .5]:
            nominal_low, nominal_high = 1. - .3/gamma, 1. + .3/gamma
            for seed in [0, 7, 42]:
                for initial in [-2., nominal_low, 1., nominal_high, 3.]:
                    for dt in [.01, .02]:
                        with self.subTest(gamma=gamma, seed=seed, initial=initial, dt=dt):
                            result = user_harness(N=4, T=1., dt=dt, gamma=gamma,
                                                  seed=seed, initial_gains=initial)
                            low = min(initial, nominal_low)
                            high = max(initial, nominal_high)
                            for key in ['all_recorded_edge_K_range',
                                        'integrated_endpoint_edge_K_range']:
                                self.assertGreaterEqual(result[key][0], low - 1e-12)
                                self.assertLessEqual(result[key][1], high + 1e-12)
                            self.assertLessEqual(result['max_edge_bound_excess'], 1e-12)
        # Mixed initial gains exercise different bounds on individual edges.
        initial = np.array([[1., -2., .4], [-2., 1., 3.], [.4, 3., 1.]])
        result = user_harness(N=3, T=1., initial_gains=initial)
        self.assertLessEqual(result['max_edge_bound_excess'], 1e-12)

    def test_history_and_endpoint_times_are_distinct(self):
        for dt in [.01, .02]:
            result = user_harness(N=2, T=2., dt=dt)
            steps = round(2./dt)
            self.assertAlmostEqual(result['last_record_time_actual'], (steps-1)*dt)
            self.assertEqual(result['last_record_time_returned'], result['last_record_time_actual'])
            self.assertEqual(result['endpoint_time'], 2.)

    def test_local_random_state_does_not_mutate_global_generator(self):
        before = np.random.get_state()
        first = user_harness(N=3, T=.1, dt=.01)
        second = user_harness(N=3, T=.1, dt=.01)
        after = np.random.get_state()
        self.assertEqual(first, second)
        self.assertEqual(before[0], after[0])
        np.testing.assert_array_equal(before[1], after[1])
        self.assertEqual(before[2:], after[2:])

    def test_invalid_grid_and_nonfinite_parameters_rejected(self):
        for args in [{'dt': 0.}, {'T': .105}, {'gamma': -1.},
                     {'alpha': float('nan')}, {'N': 1}, {'gamma': 200.},
                     {'seed': None}]:
            with self.subTest(args=args), self.assertRaises(ValueError):
                user_harness(**args)

    def test_invalid_phase_or_frequency_shape_rejected(self):
        for args in [{'initial_phases': [0.]},
                     {'natural_frequencies': [float('inf')] * 10},
                     {'initial_gains': [[1., 2.], [3., 1.]]}]:
            with self.subTest(args=args), self.assertRaises(ValueError):
                user_harness(**args)


if __name__ == '__main__':
    unittest.main()
