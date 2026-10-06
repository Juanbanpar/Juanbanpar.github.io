import { getCollection } from 'astro:content';
import { publicWriting } from './writing';

export async function getPublicWriting() {
  return publicWriting(await getCollection('writing'));
}
