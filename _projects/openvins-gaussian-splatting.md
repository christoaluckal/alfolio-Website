---
layout: page
title: OpenVINS Gaussian Splatting
description: Replay-first visual-inertial mapping pipeline for packet-backed 3D Gaussian Splatting.
img: assets/img/projects/openvins-gs-architecture.png
card_img: assets/img/projects/openvins-gs-results.png
importance: 1
github: https://github.com/christoaluckal/gaussian-splatting
related_publications: false
---

OpenVINS Gaussian Splatting is a research engineering pipeline for connecting visual-inertial state estimation to 3D Gaussian Splatting reconstruction. The project separates tracking from mapping: OpenVINS owns state estimation, while the Gaussian mapper owns initialization, append behavior, LoD training, and refinement.

The current system is replay-first and file-backed. ROS2 bag replays export packets containing images, calibrated camera metadata, poses, covariance, sparse tracks, and timing information. The mapper can then train directly from `packets.jsonl` without requiring a COLMAP-shaped scene at runtime.

## Highlights

- Built a packet-backed mapper input path that auto-detects OpenVINS replay exports.
- Ported EDGS-style RoMa correspondence initialization into the Gaussian Splatting training flow.
- Added packet-window controls for EDGS initialization experiments.
- Preserved vanilla 3DGS, split-scene, and naive LoD training behavior for controlled ablations.
- Added runtime logging for initialization time, training time, GPU memory, Gaussian count, and final metrics.

## System Overview

The pipeline is organized around a stable replay contract:

1. ROS2 replay runs OpenVINS on a real or synthetic sequence.
2. The exporter writes a packet root with `packets.jsonl` and per-camera image frames.
3. The Gaussian mapper builds fixed-pose cameras directly from packet poses and intrinsics.
4. Sparse tracks seed the initial Gaussian set, with deterministic fallback behavior when tracks are limited.
5. Optional EDGS/RoMa initialization adds triangulated Gaussians from image correspondences before standard optimization.
6. Training runs vanilla, EDGS-only, LoD-only, or EDGS+LoD variants for comparison.

The OpenVINS export is intentionally easy to consume: each `packets.jsonl` line is a self-contained mapping packet with the image path, calibrated camera model, fixed pose, uncertainty, and sparse feature observations needed by the mapper. A representative packet from the TartanAir export looks like this:

```json
{
  "packet_index": 0,
  "timestamp_sec": 3.099999905,
  "frame_id": "frame_000000_t3099999905",
  "body_frame": "imu",
  "world_frame": "global",
  "body_to_world": {
    "q_xyzw": [-0.825834, 0.563895, 0.000001, 0.004486],
    "p_xyz": [0.273696, -1.930757, 0.028967]
  },
  "world_to_body": {
    "q_xyzw": [0.825834, -0.563895, -0.000001, 0.004486],
    "p_xyz": [-1.898029, -0.448107, 0.016047]
  },
  "images": [
    {
      "camera_id": 0,
      "path": "images/cam0/frame_000000_t3099999905.png",
      "width": 640,
      "height": 640
    }
  ],
  "camera_models": [
    {
      "camera_id": 0,
      "model": "radtan",
      "resolution": [640, 640],
      "intrinsics": [320, 320, 320, 320],
      "distortion_coeffs": [0, 0, 0, 0],
      "camera_to_body": {
        "q_xyzw": [-0.5, -0.5, -0.5, 0.5],
        "p_xyz": [0, 0, 0]
      }
    }
  ],
  "pose_covariance_posori": ["6x6 position/orientation covariance"],
  "sparse_tracks": [
    {
      "feature_id": 4844,
      "camera_id": 0,
      "uv": [509.529663, 421.519592],
      "uv_norm": [0.59228, 0.317249]
    }
  ]
}
```

Because every packet carries its own pose, intrinsics, image reference, covariance, and feature tracks, the Gaussian Splatting side can build training cameras and sparse seeds directly from OpenVINS output instead of reconstructing a COLMAP directory or joining several sidecar files.

## Architecture

{% include figure.liquid loading="eager" path="assets/img/projects/openvins-gs-architecture.png" title="Replay-first OpenVINS to Gaussian Splatting architecture" class="img-fluid rounded z-depth-1" %}

The mapper keeps EDGS initialization as a pre-training phase rather than a separate renderer. A normal Gaussian scene is constructed first, then RoMa correspondences are triangulated across selected view pairs and appended to the active Gaussian model. Standard 3DGS optimization proceeds after that initialization step.

This design keeps the integration modular:

- OpenVINS provides replayable visual-inertial packets.
- Packet loading creates camera objects and sparse seeds.
- EDGS/RoMa adds dense correspondence-based initialization when enabled.
- The existing training loop handles pruning, densification, rendering, and evaluation.

## Tracking And Scene Partitioning

All results in this section use the [CoalMine environment](https://tartanair.org/environments.html) from TartanAir, an indoor, medium-scale infrastructure scene with six trajectories.

{% include figure.liquid loading="eager" path="assets/img/projects/openvins-gs-openvins-result.png" title="OpenVINS tracking result with trajectory error metrics" class="img-fluid rounded z-depth-1" %}

OpenVINS provides the fixed-pose trajectory used by the packet-backed mapper. The tracking result includes trajectory quality metrics such as RMSE and absolute trajectory error, which are useful for separating estimator quality from mapper quality during later ablations.

{% include figure.liquid loading="eager" path="assets/img/projects/openvins-gs-cluster.png" title="Three-subset camera clustering used for scene partitioning experiments" class="img-fluid rounded z-depth-1" %}

The same mapper also preserves the split-scene workflow used in earlier Gaussian Splatting experiments. The clustering visualization shows a three-subset partition, which serves as a practical precedent for later packet-window append blocks.

{% include video.liquid path="assets/video/portfolio_side_by_side_splat_timelapse_4x.mp4" title="Side-by-side reconstruction timelapse comparing non-clustering and clustering runs" caption="Side-by-side reconstruction timelapse: non-clustering run on the left, clustering run on the right." class="img-fluid rounded z-depth-1" controls=true muted=true %}

Both portfolio runs completed 50,000 training iterations and final evaluation at iteration 50,000. Clustering keeps image quality effectively unchanged while cutting the final Gaussian count by 50.1% and end-to-end runtime by 21.6%.

<style>
  .openvins-results-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .openvins-result-panel {
    border: 1px solid var(--global-divider-color);
    border-radius: 6px;
    padding: 1rem;
    background: var(--global-bg-color);
  }

  .openvins-result-panel h4 {
    font-size: 1rem;
    margin: 0 0 0.75rem;
  }

  .openvins-result-row {
    display: grid;
    grid-template-columns: minmax(7.5rem, 10rem) 1fr;
    gap: 0.75rem;
    align-items: center;
    margin: 0.6rem 0;
  }

  .openvins-result-label {
    font-size: 0.9rem;
    line-height: 1.25;
  }

  .openvins-result-value {
    display: block;
    color: var(--global-text-color-light);
    font-size: 0.8rem;
    margin-top: 0.15rem;
  }

  .openvins-result-track {
    height: 0.8rem;
    background: var(--global-code-bg-color);
    border-radius: 999px;
    overflow: hidden;
  }

  .openvins-result-bar {
    height: 100%;
    border-radius: inherit;
  }

  .openvins-result-bar.no-clustering {
    background: #3b82f6;
  }

  .openvins-result-bar.with-clustering {
    background: #f97316;
  }

  @media (max-width: 768px) {
    .openvins-results-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<div class="openvins-results-grid" aria-label="Portfolio clustering comparison histograms">
  <section class="openvins-result-panel">
    <h4>Final eval L1 <small>(lower is better)</small></h4>
    <div class="openvins-result-row">
      <div class="openvins-result-label">No clustering<span class="openvins-result-value">0.0324027</span></div>
      <div class="openvins-result-track"><div class="openvins-result-bar no-clustering" style="width: 99.4%"></div></div>
    </div>
    <div class="openvins-result-row">
      <div class="openvins-result-label">With clustering<span class="openvins-result-value">0.0326058</span></div>
      <div class="openvins-result-track"><div class="openvins-result-bar with-clustering" style="width: 100%"></div></div>
    </div>
  </section>

  <section class="openvins-result-panel">
    <h4>Final eval PSNR <small>(higher is better)</small></h4>
    <div class="openvins-result-row">
      <div class="openvins-result-label">No clustering<span class="openvins-result-value">26.1512 dB</span></div>
      <div class="openvins-result-track"><div class="openvins-result-bar no-clustering" style="width: 99.9%"></div></div>
    </div>
    <div class="openvins-result-row">
      <div class="openvins-result-label">With clustering<span class="openvins-result-value">26.1764 dB</span></div>
      <div class="openvins-result-track"><div class="openvins-result-bar with-clustering" style="width: 100%"></div></div>
    </div>
  </section>

  <section class="openvins-result-panel">
    <h4>Final num Gaussians <small>(lower is leaner)</small></h4>
    <div class="openvins-result-row">
      <div class="openvins-result-label">No clustering<span class="openvins-result-value">569,805</span></div>
      <div class="openvins-result-track"><div class="openvins-result-bar no-clustering" style="width: 100%"></div></div>
    </div>
    <div class="openvins-result-row">
      <div class="openvins-result-label">With clustering<span class="openvins-result-value">284,401</span></div>
      <div class="openvins-result-track"><div class="openvins-result-bar with-clustering" style="width: 49.9%"></div></div>
    </div>
  </section>

  <section class="openvins-result-panel">
    <h4>End-to-end time <small>(lower is faster)</small></h4>
    <div class="openvins-result-row">
      <div class="openvins-result-label">No clustering<span class="openvins-result-value">1,947.7 s</span></div>
      <div class="openvins-result-track"><div class="openvins-result-bar no-clustering" style="width: 100%"></div></div>
    </div>
    <div class="openvins-result-row">
      <div class="openvins-result-label">With clustering<span class="openvins-result-value">1,527.3 s</span></div>
      <div class="openvins-result-track"><div class="openvins-result-bar with-clustering" style="width: 78.4%"></div></div>
    </div>
  </section>
</div>

The baseline run was `portfolio_no_clustering_r2_c3_split10000_iter50000`; the clustered run was `portfolio_clustered_r2_c3_split10000_iter50000`. Both runs completed successfully, so the comparison isolates the clustering effect rather than early stopping or failed evaluation.

## Experiment Modes

The runner supports comparison launches across four main modes:

- **Vanilla 3DGS:** packet or COLMAP input with the standard sparse initialization.
- **EDGS:** RoMa correspondence initialization before optimization.
- **Naive LoD:** multi-resolution training using configured `resolution_scales`.
- **EDGS + LoD:** correspondence initialization combined with progressive resolution scales.

The current reporting tools collate per-run CSV logs into a compact Markdown and CSV summary. Reports include final quality metrics, final Gaussian count, total training time, peak reserved GPU memory, post-initialization peak GPU memory, and training GPU GB-hours.

{% include figure.liquid loading="eager" path="assets/img/projects/openvins-gs-results.png" title="Comparison table for the active reconstruction experiments" class="img-fluid rounded z-depth-1" %}

## What I Built

- Defined the active mapper baseline and documented behavior for split-scene append, LoD scheduling, EDGS initialization, and runtime logging.
- Implemented packet-backed scene loading from OpenVINS exports.
- Added packet metadata propagation into the mapper camera objects.
- Added CLI controls for packet-window EDGS initialization, including window size, anchor, skip frames, and max frames.
- Fixed integration bugs around correspondence tensor shapes, appended Gaussian device placement, evaluation metric returns, and LoD double-downsampling.
- Built experiment collation that infers EDGS and LoD mode from logs when short run names do not encode the full experiment type.

## Current Status

Implemented and smoke-tested:

- ROS2 replay export on real and TartanAir-style data.
- Packet-backed mapper loading from retained export roots.
- Low-memory fixed-pose packet training.
- EDGS-enabled initialization on packet windows.
- Runtime metrics and collated experiment reports.

Remaining work:

- Freeze the packet schema and add a validator.
- Harden sparse seed generation for more packet distributions.
- Replace split-scene append prototypes with packet-window append blocks.
- Add live transport only after replay/file-backed packet ingest is stable.
- Run a full comparison against Photo-SLAM on quality, memory, latency, and robustness.

## Representative Commands

```bash
python train_nomask.py \
  -s bags/tartanair_packets \
  -m output/packet_edgs_lod \
  --edgs_init \
  --edgs_packet_window_size 32 \
  --edgs_packet_window_anchor 0 \
  --edgs_skip_frames 2 \
  --resolution_scales 8 4 2 \
  --eval
```

```bash
python scripts/collate_run_metrics.py \
  --output_root output \
  --summary_csv output/collated_summary.csv \
  --report_md output/cost_analysis.md
```

## Links

[Code](https://github.com/christoaluckal/gaussian-splatting)
