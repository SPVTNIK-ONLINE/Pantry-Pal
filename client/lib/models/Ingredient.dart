class Ingredient {
  final String id;
  final String name;

  Ingredient({this.id = 'none', this.name = 'none'});

  factory Ingredient.fromJson(Map<String, dynamic> json) {
    return Ingredient(
      id: json['_id'],
      name: json['name'],
    );
  }

  static List<Ingredient> fromJsonList(List list) {
    return list.map((item) => Ingredient.fromJson(item)).toList();
  }

  static List<String> toIdString(Set<Ingredient> list) {
    return list.map((item) => item.id).toList();
  }

  String ingredientAsString() {
    return '#${this.id} ${this.name}';
  }

  bool isEqual(Ingredient model) {
    return this.id == model.id;
  }

  @override
  String toString() => name;
}
