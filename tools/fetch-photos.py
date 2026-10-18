"""Fetch licensed photo assets from the original Pexels image CDN."""
from pathlib import Path
import concurrent.futures
import hashlib
import json
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
PHOTOS = [
    ('community-hero', 5029923, 'Anna Shvets', 'people-planting-plant-together', 'Volunteers working together around a newly planted tree.', None),
    ('lantern-walk', 6074091, 'Utpal Sarkar', 'people-walking-on-street', 'People strolling along a street decorated with red lanterns.', 1),
    ('coast-planting', 7656721, 'Thirdman', 'volunteers-on-tree-planting', 'Two volunteers planting young trees in an open field.', 2),
    ('shared-table', 5638643, 'Askar Abayev', 'group-of-people-sharing-dinner-at-table-together-in-backyard', 'Friends sharing food at an outdoor table.', 3),
    ('art-workshop', 11000897, 'Vladimir Konoplev', 'people-painting-on-canvas', 'Participants painting canvases during an outdoor art workshop.', 4),
    ('wellbeing-walk', 8497644, 'Liliana Drew', 'a-man-and-a-woman-running-at-the-park', 'Two adults exercising together on a tree-lined park path.', 5),
    ('skills-swap', 16850246, 'Safari Consoler', 'people-working-in-a-workshop', 'Carpentry apprentices sharing practical skills in a workshop.', 6),
    ('pantry-market', 7156169, 'Gustavo Fring', 'group-of-volunteers-doing-an-inventory', 'Volunteers sorting boxes of donated supplies.', 7),
    ('creek-cleanup', 36713506, 'Vitaly Gariev', 'cheerful-volunteers-cleaning-riverside-beach', 'Volunteers collecting litter beside a river.', 8),
    ('community-music', 3433363, 'Mister Mister', 'people-watching-concert', 'An audience gathered for an outdoor music performance.', 9),
    ('mindful-garden', 18364977, 'Balljinder Singh', 'people-practising-yoga-outside', 'A group practising yoga in an outdoor garden.', 10),
    ('volunteer-planning', 6591147, 'cottonbro studio', 'volunteers-in-blue-long-sweater-standing-in-front-of-brown-boxes-while-looking-at-the-camera', 'Volunteers standing together beside prepared donation boxes.', 11),
    ('neighbour-day', 7728078, 'Greta Hoffman', 'senior-gardeners-standing-in-garden', 'Two older adults tending a garden together.', 12),
]

def fetch(photo):
    name, photo_id, author, slug, alt, event_id = photo
    directory = ROOT / 'clientside/public/assets/photos'
    directory.mkdir(parents=True, exist_ok=True)
    url = f'https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg?auto=compress&cs=tinysrgb&w=1200&q=82'
    destination = directory / f'{name}.jpg'
    request = urllib.request.Request(url, headers={'User-Agent': 'Harbourlight-course-project/1.0'})
    with urllib.request.urlopen(request, timeout=45) as response:
        data = response.read()
    if data[:2] != b'\xff\xd8' or len(data) < 5000:
        raise ValueError(f'Invalid JPEG response: {name}')
    destination.write_bytes(data)
    print(name, len(data))
    return {'path': f'assets/photos/{name}.jpg', 'id': photo_id, 'author': author,
            'source': f'https://www.pexels.com/photo/{slug}-{photo_id}/',
            'download': url, 'license': 'https://www.pexels.com/license/',
            'alt': alt, 'eventId': event_id, 'sha256': hashlib.sha256(data).hexdigest()}

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        manifest = list(pool.map(fetch, PHOTOS))
    (ROOT / 'clientside/public/photo-manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
