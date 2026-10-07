package repository

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"sidejob-server/internal/model"
)

var ErrPublishPresetNotFound = errors.New("publish preset not found")

// PublishPresetRepository 管理按闲鱼账号隔离的常用发布方案。
type PublishPresetRepository struct{ collection *mongo.Collection }

func NewPublishPresetRepository(database *mongo.Database) *PublishPresetRepository {
	return &PublishPresetRepository{collection: database.Collection("publish_presets")}
}

func (repository *PublishPresetRepository) EnsureIndexes(ctx context.Context) error {
	_, err := repository.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "accountId", Value: 1}, {Key: "updatedAt", Value: -1}}},
		{Keys: bson.D{{Key: "accountId", Value: 1}, {Key: "name", Value: 1}}, Options: options.Index().SetUnique(true)},
	})
	return err
}

func (repository *PublishPresetRepository) List(ctx context.Context, accountID string) ([]model.PublishPreset, error) {
	cursor, err := repository.collection.Find(ctx, bson.M{"accountId": accountID}, options.Find().SetSort(bson.D{{Key: "updatedAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var presets []model.PublishPreset
	err = cursor.All(ctx, &presets)
	return presets, err
}

func (repository *PublishPresetRepository) Create(ctx context.Context, preset model.PublishPreset) error {
	_, err := repository.collection.InsertOne(ctx, preset)
	return err
}

func (repository *PublishPresetRepository) Update(ctx context.Context, preset model.PublishPreset) error {
	result, err := repository.collection.ReplaceOne(ctx, bson.M{"_id": preset.ID, "accountId": preset.AccountID}, preset)
	if err == nil && result.MatchedCount == 0 {
		return ErrPublishPresetNotFound
	}
	return err
}

func (repository *PublishPresetRepository) Delete(ctx context.Context, accountID, presetID string) error {
	result, err := repository.collection.DeleteOne(ctx, bson.M{"_id": presetID, "accountId": accountID})
	if err == nil && result.DeletedCount == 0 {
		return ErrPublishPresetNotFound
	}
	return err
}
