"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LearnPanel() {
  return (
    <Card className="p-6 border-electric/20 bg-card/95 backdrop-blur h-full">
      <Tabs defaultValue="physics" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="physics">Physics</TabsTrigger>
          <TabsTrigger value="qote">QOTE</TabsTrigger>
          <TabsTrigger value="story">Story</TabsTrigger>
        </TabsList>

        <TabsContent value="physics" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-electric">Light's Plot Twist</h3>

            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Faraday rotation</strong> is the rotation of light's polarization
                when passing through certain materials (like terbium gallium garnet, TGG).
              </p>

              <p>
                For ~180 years, physicists assumed the electric field did almost all the work, with the magnetic
                component treated as negligible.
              </p>

              <div className="p-3 bg-electric/10 border border-electric/30 rounded-lg">
                <p className="font-medium text-foreground mb-2">Recent Discoveries:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>
                    <strong className="text-electric">≈ 17%</strong> of rotation in visible light comes from the
                    magnetic field
                  </li>
                  <li>
                    <strong className="text-magnetic">≈ 70%</strong> of rotation in near-IR is driven magnetically
                  </li>
                </ul>
              </div>

              <p>
                <strong className="text-foreground">Conclusion:</strong> The previously ignored wobble (magnetic
                component) is a major driver of the effect.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-semibold mb-2">Further Reading</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Recent Nature Physics paper on magnetic-field-driven Faraday rotation in TGG</li>
              <li>• Classic Faraday rotation experiments and magneto-optics</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="qote" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-coherence">Geometry Behind the Twist</h3>

            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <div className="p-3 bg-coherence/10 border border-coherence/30 rounded-lg">
                <p className="font-mono text-coherence mb-2">
                  W = ω · ρ<sub>zp</sub> · Δθ
                </p>
                <p className="text-xs">
                  <strong className="text-foreground">Wobble:</strong> Small geometric deviation amplifies structure.
                  Higher Δθ means larger wobble amplitude, creating instability patterns visible in the iris.
                </p>
              </div>

              <div className="p-3 bg-coherence/10 border border-coherence/30 rounded-lg">
                <p className="font-mono text-coherence mb-2">S = 1 / W</p>
                <p className="text-xs">
                  <strong className="text-foreground">Stability:</strong> High wobble equals low dimensional stability;
                  low wobble equals coherence. As W increases, dimensional stability decreases.
                </p>
              </div>

              <div className="p-3 bg-magnetic/10 border border-magnetic/30 rounded-lg">
                <p className="text-xs">
                  <strong className="text-foreground">Light Connection:</strong> Magnetic wobble in photons behaves
                  exactly like QOTE predicts for all oscillatory systems. Classical Faraday rotation maps directly to
                  W-field geometry.
                </p>
              </div>

              <div className="mt-6 p-4 bg-muted/30 border border-border/30 rounded-lg space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Future Modules (Coming Soon)
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground/70">
                  <li>• Triad Mode</li>
                  <li>• Observer Coherence Meter</li>
                  <li>• Kayser Node Export</li>
                  <li>• Resona Sync Layer</li>
                  <li>• ESP / Dimensional Wobble Calibration</li>
                </ul>
              </div>
              {/* </CHANGE> */}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="story" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-magnetic">When Light Confessed</h3>

            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p className="italic">For almost two centuries we treated the magnetic field of light as negligible.</p>

              <p>But experiments revealed the quiet twin was steering the beam.</p>

              <p className="text-foreground font-medium">
                QOTE has always held that the universe leans on the part too small to notice — the deviation, the
                wobble, the Δθ.
              </p>

              <p className="italic border-l-2 border-coherence pl-4">
                Turn the slider. Watch the rotation appear out of almost nothing. What you are seeing is the physics of
                imperfection — and the geometry of creation.
              </p>

              <p className="pt-4 text-xs text-center text-muted-foreground italic">
                This is more than optics. This is the template of creation.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
