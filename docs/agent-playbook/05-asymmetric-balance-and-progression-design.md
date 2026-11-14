# Playbook 05: Asymmetric Offense vs. Defense Rebalance & Perpetual Progression

**Originating Problem**: In early prototypes (V1), Defenders could spam unlimited infinite-HP turrets and trivially camp all waves, while Attackers suffered unfair attrition against turrets and stalled after clearing once with zero replay incentive.

---

## 1. Asymmetric Co-Op / Defense Tuning (`src/core/engine-base.html`)

Instead of giving Attackers and Defenders symmetric stats (which feels flat), tune counter-play levers explicitly inside `c` (`mM(i)`):

| Parameter / Mechanic | V1 Unbalanced Bottleneck | V2 / V3 Verified Balance |
| --- | --- | --- |
| **Defender Turrets (`[G]`)** | Unlimited placement + infinite duration | `turretsMax: 2`, finite `115 HP`, `42s` operational lifetime (`turretsLeft: 2`) |
| **Wave Escalation** | Flat enemy spawns | **`4` multi-lane assault waves + `2` bosses** (`defTotalWaves: 4`, `defWaveT: 3`) |
| **Attacker EMP Overload (`[Q]`)** | Short stun window against static turret nests | Extended **11s EMP overload** (`qMax: 11` for Assault, `14` for Defense) disabling defensive turrets & stunning hostiles |
| **Attacker `[G]` Wingman** | None | Autonomous tactical wingman (`wingmen`) providing suppression fire during assault breaches |

---

## 2. Three-Layer Progression & Replayability Loop

Every single combat action in both FPS and Tabletop modes feeds unified career progression persisted under **`localStorage["skyline.career.v2"]`**:

1. **Tactical Decay Combo (`7.5s` window)**:
   - Kills and objective completions increment multiplier `c.combo` (`x1.0 ~ x4.0`) with live UI decay ratio (`c.comboT / 7.5`).
   - Encourages decisive movement between relays instead of passive peeking.
2. **8-Rank Military Ladder (`RANKS`)**:
   - `列兵 (0)` -> `下士 (800)` -> `中士 (2,000)` -> `少尉 (4,000)` -> `上尉 (7,000)` -> `少校 (11,500)` -> `上校 (17,500)` -> `将星 (25,000)`.
3. **10 Achievement Medals (`MEDALS`)**:
   - `8` core FPS combat/objective medals (`first_blood`, `weak_master`, `neural_ace`, `combo_king`, `sabotage_pro`, `iron_bastion`, plus progression medals) + **`2` Tabletop Wargame medals** (`table_master`, `table_grand`).
4. **Tier +1 Infinite Scaling Ladder (`[data-act="nexttier"]`)**:
   - Clearing a mission never hits a dead end: pressing **晋升下一阶梯** advances `i.tier = (i.tier || 1) + 1`, updating Mission codes (`B4·攻·T2` / `D7·守·T2`) and rewarding sustained mastery (`tier_ascend`).
