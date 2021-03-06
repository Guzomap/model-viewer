/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial.js';
import {Mesh} from 'three/src/objects/Mesh.js';

import {Model} from '../../../features/scene-graph/model.js';
import {$correlatedObjects} from '../../../features/scene-graph/three-dom-element.js';
import {CorrelatedSceneGraph} from '../../../three-components/gltf-instance/correlated-scene-graph.js';
import {assetPath, loadThreeGLTF} from '../../helpers.js';

const expect = chai.expect;

const ASTRONAUT_GLB_PATH = assetPath('models/Astronaut.glb');

suite('scene-graph/model', () => {
  suite('Model', () => {
    test('exposes a list of materials in the scene', async () => {
      const threeGLTF = await loadThreeGLTF(ASTRONAUT_GLB_PATH);
      const materials: Set<MeshStandardMaterial> = new Set();

      threeGLTF.scene.traverse((object) => {
        if ((object as Mesh).isMesh) {
          const material = (object as Mesh).material;
          if (Array.isArray(material)) {
            material.forEach(
                (material) => materials.add(material as MeshStandardMaterial));
          } else {
            materials.add(material as MeshStandardMaterial);
          }
        }
      });

      const model = new Model(CorrelatedSceneGraph.from(threeGLTF));

      const collectedMaterials = new Set<MeshStandardMaterial>();

      model.materials.forEach((material) => {
        for (const threeMaterial of material[$correlatedObjects] as
             Set<MeshStandardMaterial>) {
          collectedMaterials.add(threeMaterial);
          expect(materials.has(threeMaterial)).to.be.true;
        }
      });

      expect(collectedMaterials.size).to.be.equal(materials.size);
    });
  });
});
