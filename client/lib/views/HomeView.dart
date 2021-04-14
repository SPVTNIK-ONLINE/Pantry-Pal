import 'package:client/models/Recipe.dart';
import 'package:client/utils/API.dart';
import 'package:client/utils/UserProvider.dart';
import 'package:client/widgets/RecipeCard.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class HomeView extends StatefulWidget {
  @override
  HomeViewState createState() => new HomeViewState();
}

class HomeViewState extends State<HomeView> {
  late ScrollController controller;
  final limit = 10;

  bool _isLoading = false;
  bool _hasMore = true;
  List<Recipe> _recipes = <Recipe>[];
  int offset = 0;
  late String _token;

  @override
  void initState() {
    super.initState();
    _token = Provider.of<UserProvider>(context, listen: false).user.token;

    _getRecipes(0);

    controller = new ScrollController(initialScrollOffset: 1)
      ..addListener(_scrollListener);
  }

  @override
  void dispose() {
    controller.removeListener(_scrollListener);
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scrollbar(
      child: GridView.builder(
        padding: EdgeInsets.fromLTRB(30, 15, 15, 30),
        controller: controller,
        shrinkWrap: true,
        itemCount: _recipes.length > 0 ? _recipes.length : limit,
        itemBuilder: (context, index) {
          return _recipes.length > 0
              ? RecipeCard(_recipes[index])
              : Card(child: CircularProgressIndicator());
        },
        gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
            mainAxisExtent: 391,
            maxCrossAxisExtent: 500,
            mainAxisSpacing: 30,
            crossAxisSpacing: 30,
            childAspectRatio: 391 / 500),
      ),
    );
  }

  void _getRecipes(int offset) async {
    List<Recipe> parsedRecipes = await API().getRecipes(_token, offset, limit);
    if (!mounted) return;
    setState(() {
      if (parsedRecipes.length <= 0) {
        _hasMore = false;
      } else {
        _recipes.addAll(parsedRecipes);
      }
      _isLoading = false;
    });
  }

  void _scrollListener() {
    if (controller.offset >= controller.position.maxScrollExtent &&
        !controller.position.outOfRange) {
      print('load');
      setState(() {
        _isLoading = true;

        offset = offset + 1;
        if (_isLoading && _hasMore) {
          _getRecipes(offset);
        }
      });
    }
  }
}
