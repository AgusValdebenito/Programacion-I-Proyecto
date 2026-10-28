from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password as django_validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Usuario

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['name'] = user.name
        token['role'] = user.role
        return token

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Credenciales incorrectas')

        if not user.check_password(password):
            raise serializers.ValidationError('Credenciales incorrectas')

        if not user.is_active:
            raise serializers.ValidationError('Usuario desactivado')

        data = {}
        refresh = self.get_token(user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role,
        }
        return data


class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(
        choices=[("cliente", "Cliente"), ("vendedor", "Vendedor")],
        required=False,
        default="cliente",
    )

    class Meta:
        model = Usuario
        fields = [
            "id",
            "username",
            "password",
            "name",
            "email",
            "phone",
            "role",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_password(self, value):
        try:
            django_validate_password(value, user=self.instance)
        except DjangoValidationError as err:
            raise serializers.ValidationError(list(err.messages))
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = Usuario(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        request = self.context.get("request")
        if request and not request.user.is_staff:
            validated_data.pop("role", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance
