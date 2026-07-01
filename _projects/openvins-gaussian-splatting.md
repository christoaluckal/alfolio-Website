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

## Architecture

{% include figure.liquid loading="eager" path="assets/img/projects/openvins-gs-architecture.png" title="Replay-first OpenVINS to Gaussian Splatting architecture" class="img-fluid rounded z-depth-1" %}

The mapper keeps EDGS initialization as a pre-training phase rather than a separate renderer. A normal Gaussian scene is constructed first, then RoMa correspondences are triangulated across selected view pairs and appended to the active Gaussian model. Standard 3DGS optimization proceeds after that initialization step.

This design keeps the integration modular:

- OpenVINS provides replayable visual-inertial packets.
- Packet loading creates camera objects and sparse seeds.
- EDGS/RoMa adds dense correspondence-based initialization when enabled.
- The existing training loop handles pruning, densification, rendering, and evaluation.

## Tracking And Scene Partitioning

{% include figure.liquid loading="eager" path="assets/img/projects/openvins-gs-openvins-result.png" title="OpenVINS tracking result with trajectory error metrics" class="img-fluid rounded z-depth-1" %}

OpenVINS provides the fixed-pose trajectory used by the packet-backed mapper. The tracking result includes trajectory quality metrics such as RMSE and absolute trajectory error, which are useful for separating estimator quality from mapper quality during later ablations.

{% include figure.liquid loading="eager" path="assets/img/projects/openvins-gs-cluster.png" title="Three-subset camera clustering used for scene partitioning experiments" class="img-fluid rounded z-depth-1" %}

The same mapper also preserves the split-scene workflow used in earlier Gaussian Splatting experiments. The clustering visualization shows a three-subset partition, which serves as a practical precedent for later packet-window append blocks.

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
