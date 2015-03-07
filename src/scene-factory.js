/**
 * Created by Shaun on 3/4/15
 *
 */

register('SceneFactory', [
    'Resource', 
    'Common', 
    'Sprite', 
    'ImageResource',
    'SpriteAnimation'
  ], 
function(Resource, Common, Sprite, ImageResource, SpriteAnimation) {
  'use strict';

  // REMINDER: resources need caching

  return function(sceneData) {
    var layerDefinitions = sceneData.layerDefinitions;

    return {
      getBackground: function () {
        var data = layerDefinitions.background;
        var fullUrl = Common.normalizeUrl(data.backgroundUrl, sceneData.baseUrl);

        return ImageResource(fullUrl);
      },
      getEntities: function () {
        var data = layerDefinitions.entities;
        var resourcePool = Resource();

        data.sprites.forEach(function(spriteData) {
          var spriteResource = Sprite(spriteData, sceneData.baseUrl)
            .ready(function(sprite) {
              sprite.animation = SpriteAnimation(sprite.definition.frameSet)
                .play('run');

              return sprite;
            });

          resourcePool.add(spriteResource);
        });

        return resourcePool;
      },
      getCollisions: function() {
        return layerDefinitions.collisions;
      }
    };
  };
});