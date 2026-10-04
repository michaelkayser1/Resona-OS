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
        result = user_harness(N=4, T=2., dt=.01)
        low, high = result['all_recorded_edge_K_range']
        self.assertGreaterEqual(low, .4)
        self.assertLessEqual(high, 1.6)
        low, high = result['integrated_endpoint_edge_K_range']
        self.assertGreaterEqual(low, .4)
        self.assertLessEqual(high, 1.6)

    def test_history_and_endpoint_times_are_distinct(self):
        result = user_harness(N=2, T=2., dt=.01)
        self.assertAlmostEqual(result['last_record_time_actual'], 1.99)
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
                     {'natural_frequencies': [float('inf')] * 10}]:
            with self.subTest(args=args), self.assertRaises(ValueError):
                user_harness(**args)


if __name__ == '__main__':
    unittest.main()
