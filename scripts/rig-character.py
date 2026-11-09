"""Add a lightweight workspace rig to the supplied static GLB; preserve source."""
import json, math, struct
from pathlib import Path

source = Path('public/model/character.glb')
if not source.is_file():
    raise SystemExit('Missing public/model/character.glb. Add the source model before running this optional rigging script.')
raw = source.read_bytes()
json_size = struct.unpack_from('<I', raw, 12)[0]
doc = json.loads(raw[20:20 + json_size])
blob = bytearray(raw[28 + json_size:])
types = {5126: ('f', 4), 5125: ('I', 4), 5123: ('H', 2), 5121: ('B', 1)}

def read(index):
    a = doc['accessors'][index]; view = doc['bufferViews'][a['bufferView']]
    code, size = types[a['componentType']]
    width = {'SCALAR': 1, 'VEC3': 3}[a['type']]
    offset = view.get('byteOffset', 0) + a.get('byteOffset', 0)
    return [struct.unpack_from('<' + code * width, blob, offset + i * view.get('byteStride', size * width)) for i in range(a['count'])]

def append(values, code, component, kind, count):
    while len(blob) % 4: blob.append(0)
    offset = len(blob); blob.extend(struct.pack('<' + code * len(values), *values))
    view = len(doc['bufferViews'])
    doc['bufferViews'].append({'buffer': 0, 'byteOffset': offset, 'byteLength': len(blob) - offset})
    index = len(doc['accessors'])
    doc['accessors'].append({'bufferView': view, 'componentType': component, 'count': count, 'type': kind})
    return index

joints = []
absolute = []
by_name = {}
def joint(name, position, parent=None):
    i = len(joints); node = len(doc['nodes']); joints.append(node); absolute.append(position); by_name[name] = i
    p = absolute[parent] if parent is not None else [0, 0, 0]
    doc['nodes'].append({'name': name, 'translation': [position[k] - p[k] for k in range(3)]})
    if parent is not None: doc['nodes'][joints[parent]].setdefault('children', []).append(node)
    return i
root = joint('workspace_root', [0, 0, 0])
head = joint('workspace_head', [0, 1.52, 0], root)
for side, sign in [('left', -1), ('right', 1)]:
    arm = joint(side + '_upper_arm', [sign * .205, 1.405, 0], root)
    forearm = joint(side + '_forearm', [sign * .269, 1.16, .025], arm)
    hand = joint(side + '_hand', [sign * .305, .895, .09], forearm)
    joint(side + '_eye', [sign * .043, 1.686, .105], head)

for mesh in doc['meshes']:
    p = mesh['primitives'][0]; vertices = read(p['attributes']['POSITION']); indices = [v[0] for v in read(p['indices'])]
    parents = list(range(len(vertices)))
    def find(a):
        while parents[a] != a:
            parents[a] = parents[parents[a]]; a = parents[a]
        return a
    for i in range(0, len(indices), 3):
        a = find(indices[i]); parents[find(indices[i + 1])] = a; parents[find(indices[i + 2])] = a
    components = {}
    for i, v in enumerate(vertices): components.setdefault(find(i), []).append(i)
    assignments = {}
    for ids in components.values():
        lo = [min(vertices[i][k] for i in ids) for k in range(3)]
        hi = [max(vertices[i][k] for i in ids) for k in range(3)]
        center = [(lo[k] + hi[k]) / 2 for k in range(3)]
        name = mesh['name']; side = 'left' if center[0] < 0 else 'right'
        is_eye = name in ['EyeWhite', 'Iris', 'Pupil'] or (name == 'SkinShadow' and lo[1] > 1.66 and abs(center[0]) > .02)
        is_head = name in ['Lips', 'Beard_Brows', 'Dreads_A', 'Dreads_B', 'Dreads_C'] or (name in ['Skin', 'SkinShadow'] and lo[1] > 1.52)
        is_arm = (name == 'Skin' and hi[1] < .9) or (name == 'Hoodie' and abs(center[0]) > .18) or (name == 'HoodieRib' and abs(center[0]) > .2)
        for i in ids:
            x, y, z = vertices[i]
            if is_eye: weights = [(by_name[side + '_eye'], 1)]
            elif is_head: weights = [(head, 1)]
            elif is_arm:
                # Smooth elbow transition; cuffs and hands follow the wrist.
                if name == 'Skin' or name == 'HoodieRib': weights = [(by_name[side + '_hand'], 1)]
                else:
                    upper_weight = max(0, min(1, (y - 1.12) / .11))
                    weights = [(by_name[side + '_upper_arm'], upper_weight), (by_name[side + '_forearm'], 1 - upper_weight)]
            elif name in ['Skin', 'SkinShadow'] and center[1] > 1.45:
                w = max(0, min(1, (y - 1.49) / .07)); weights = [(head, w), (root, 1 - w)]
            else: weights = [(root, 1)]
            assignments[i] = weights
    skin_indices = []; skin_weights = []
    for i in range(len(vertices)):
        w = assignments[i]
        skin_indices.extend([a for a, _ in w] + [0] * (4 - len(w)))
        skin_weights.extend([v for _, v in w] + [0] * (4 - len(w)))
    p['attributes']['JOINTS_0'] = append(skin_indices, 'H', 5123, 'VEC4', len(vertices))
    p['attributes']['WEIGHTS_0'] = append(skin_weights, 'f', 5126, 'VEC4', len(vertices))
    normals = [[0., 0., 0.] for _ in vertices]
    for i in range(0, len(indices), 3):
        a, b, c = indices[i:i + 3]
        u = [vertices[b][k] - vertices[a][k] for k in range(3)]; v = [vertices[c][k] - vertices[a][k] for k in range(3)]
        n = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]]
        for j in [a, b, c]:
            for k in range(3): normals[j][k] += n[k]
    normal_values = []
    for n in normals:
        length = math.sqrt(sum(x*x for x in n)) or 1
        normal_values.extend(x / length for x in n)
    p['attributes']['NORMAL'] = append(normal_values, 'f', 5126, 'VEC3', len(vertices))

matrices = []
for x, y, z in absolute: matrices.extend([1,0,0,0, 0,1,0,0, 0,0,1,0, -x,-y,-z,1])
inverse = append(matrices, 'f', 5126, 'MAT4', len(joints))
doc['skins'] = [{'name': 'Workspace animation adapter', 'joints': joints, 'skeleton': joints[root], 'inverseBindMatrices': inverse}]
for node in doc['nodes']:
    if 'mesh' in node: node['skin'] = 0
for scene in doc['scenes']: scene['nodes'].append(joints[root])
doc['buffers'][0]['byteLength'] = len(blob)
doc['asset']['extras'] = {'source': '/model/character.glb', 'note': 'Derived rig; source meshes and materials preserved. Rebuild with python3 scripts/rig-character.py.'}
encoded = json.dumps(doc, separators=(',', ':')).encode()
while len(encoded) % 4: encoded += b' '
while len(blob) % 4: blob.append(0)
out = struct.pack('<4sII', b'glTF', 2, 28 + len(encoded) + len(blob)) + struct.pack('<II', len(encoded), 0x4E4F534A) + encoded + struct.pack('<II', len(blob), 0x004E4942) + blob
Path('public/model/character-workspace.glb').write_bytes(out)
print(f'Rigged {len(doc["meshes"])} meshes, {len(joints)} joints; {len(out):,} bytes. Original preserved.')
