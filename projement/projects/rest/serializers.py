from rest_framework import serializers
from django.db.models import F

from decimal import Decimal

from projects.models import Project, Company, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name", "color")


class CompanySerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = ("id", "name", "tags")


class ProjectSerializer(serializers.ModelSerializer):
    company = CompanySerializer(many=False, read_only=True)
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            "id",
            "company",
            "tags",
            "title",
            "start_date",
            "end_date",
            "estimated_design",
            "actual_design",
            "estimated_development",
            "actual_development",
            "estimated_testing",
            "actual_testing",
            "has_ended",
            "total_estimated_hours",
            "total_actual_hours",
            "is_over_budget",
        )
        read_only_fields = (
            "title",
            "start_date",
            "end_date",
            "estimated_design",
            "estimated_development",
            "estimated_testing",
        )

    def get_tags(self, obj: Project):
        return TagSerializer(obj.company.tags, many=True).data

    def update(self, instance, validated_data):
        # Update the actual hours if provided in the request data
        actual_design = validated_data.pop("actual_design", None)
        actual_development = validated_data.pop("actual_development", None)
        actual_testing = validated_data.pop("actual_testing", None)

        if actual_design is not None:
            Project.objects.filter(pk=instance.pk).update(
                actual_design=F("actual_design") + Decimal(actual_design)
            )
        if actual_development is not None:
            Project.objects.filter(pk=instance.pk).update(
                actual_development=F("actual_development") + Decimal(actual_development)
            )
        if actual_testing is not None:
            Project.objects.filter(pk=instance.pk).update(
                actual_testing=F("actual_testing") + Decimal(actual_testing)
            )

        # Reload the instance to reflect the database changes
        instance.refresh_from_db()

        # Call the default update method to handle other fields
        updated_instance = super().update(instance, validated_data)

        return updated_instance
